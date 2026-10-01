import mongoose from 'mongoose';
import User from '../models/User.js';
import MatrimonialProfile from '../models/MatrimonialProfile.js';
import { Interest, Match, Shortlist } from '../models/Interaction.js';
import {
  Notification,
  Report,
  Plan,
  Subscription,
  Payment
} from '../models/Platform.js';
import {
  AuditLog,
  ContactRequest,
  CustomerNote,
  ProfileView,
  RelationshipManagerAssignment,
  SupportTicket
} from '../models/Business.js';
import { asyncHandler, ApiError, ok } from '../utils/http.js';
import { serializeProfileForViewer } from '../services/profilePrivacy.js';
import { emailUser } from '../services/notificationEmailService.js';
import {
  getSystemSettings,
  providerDiagnostics
} from '../services/systemService.js';

const escapedRegex = (value) =>
  new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
const validId = (id) => {
  if (!mongoose.isValidObjectId(id))
    throw new ApiError(400, 'Invalid record ID.');
};
const pageOptions = (req) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1),
    limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
};
const paginated = (items, total, page, limit) => ({
  items,
  pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
});
export const overview = asyncHandler(async (_req, res) => {
  const week = new Date(Date.now() - 7 * 864e5),
    [
      users,
      active,
      pending,
      approvedThisWeek,
      interests,
      matches,
      reports,
      paidMembers
    ] = await Promise.all([
      User.countDocuments(),
      MatrimonialProfile.countDocuments({ visibility: 'active' }),
      MatrimonialProfile.countDocuments({ visibility: 'pending_review' }),
      MatrimonialProfile.countDocuments({
        visibility: 'active',
        moderatedAt: { $gte: week }
      }),
      Interest.countDocuments(),
      Match.countDocuments(),
      Report.countDocuments({ status: 'Open' }),
      Subscription.countDocuments({ status: 'Active' })
    ]);
  ok(res, {
    users,
    active,
    pending,
    approvedThisWeek,
    interests,
    matches,
    reports,
    paidMembers
  });
});
export const dashboard = asyncHandler(async (req, res) => {
  const now = new Date(),
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    week = new Date(now.getTime() - 7 * 864e5),
    month = new Date(now.getFullYear(), now.getMonth(), 1),
    expiring = new Date(now.getTime() + 7 * 864e5),
    revenueMatch = { status: 'Paid', verifiedAt: { $ne: null } },
    [
      totalUsers, activeUsers, verifiedUsers, todayUsers, weekUsers, monthUsers,
      suspendedUsers, blockedUsers, deletedUsers, profileStatuses, interests,
      pendingInterests, matches, contactRequests, contactUnlocks, shortlists,
      activeSubscriptions, expiringSubscriptions, expiredSubscriptions,
      planDistribution, revenue, successfulPayments, failedPayments,
      refunded, openSupport, prioritySupport, openReports
    ] = await Promise.all([
      User.countDocuments(), User.countDocuments({ status: 'Active' }),
      User.countDocuments({ $or: [{ phoneVerified: true }, { emailVerified: true }] }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: week } }),
      User.countDocuments({ createdAt: { $gte: month } }),
      User.countDocuments({ status: 'Suspended' }), User.countDocuments({ status: 'Blocked' }),
      User.countDocuments({ status: 'Deleted' }),
      MatrimonialProfile.aggregate([{ $group: { _id: '$visibility', count: { $sum: 1 } } }]),
      Interest.countDocuments(), Interest.countDocuments({ status: 'Pending' }), Match.countDocuments(),
      ContactRequest.countDocuments(), ContactRequest.countDocuments({ $or: [{ requesterUnlockedAt: { $ne: null } }, { receiverUnlockedAt: { $ne: null } }] }),
      Shortlist.countDocuments(), Subscription.countDocuments({ status: 'Active' }),
      Subscription.countDocuments({ status: 'Active', endsAt: { $gt: now, $lte: expiring } }),
      Subscription.countDocuments({ status: 'Expired' }),
      Subscription.aggregate([{ $match: { status: 'Active' } }, { $group: { _id: '$planNameSnapshot', count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: revenueMatch }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments(revenueMatch), Payment.countDocuments({ status: 'Failed' }),
      Payment.aggregate([{ $match: { status: 'Refunded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      SupportTicket.countDocuments({ priority: 'Priority', status: { $in: ['Open', 'In Progress'] } }),
      Report.countDocuments({ status: 'Open' })
    ]);
  const profiles = Object.fromEntries(profileStatuses.map((x) => [x._id, x.count]));
  const data = {
    customers: { total: totalUsers, active: activeUsers, verified: verifiedUsers, today: todayUsers, week: weekUsers, month: monthUsers, suspended: suspendedUsers, blocked: blockedUsers, deleted: deletedUsers },
    profiles,
    matrimonial: { interests, pendingInterests, matches, contactRequests, contactUnlocks, shortlists },
    subscriptions: { active: activeSubscriptions, expiringIn7Days: expiringSubscriptions, expired: expiredSubscriptions, planDistribution },
    supportSafety: { openSupport, prioritySupport, openReports, pendingModeration: profiles.pending_review || 0 }
  };
  if (req.user.role !== 'moderator')
    data.finance = { capturedRevenue: revenue[0]?.total || 0, successfulPayments, failedPayments, refundedAmount: refunded[0]?.total || 0 };
  ok(res, data);
});

export const revenue = asyncHandler(async (req, res) => {
  const range = ['7d', '30d', '90d', 'this_year'].includes(req.query.range) ? req.query.range : '30d',
    now = new Date(),
    days = range === '7d' ? 7 : range === '90d' ? 90 : 30,
    from = range === 'this_year' ? new Date(now.getFullYear(), 0, 1) : new Date(now.getTime() - days * 864e5),
    base = { createdAt: { $gte: from, $lte: now } },
    [summary, daily, byPlan] = await Promise.all([
      Payment.aggregate([{ $match: base }, { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: { ...base, status: 'Paid', verifiedAt: { $ne: null } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, amount: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Payment.aggregate([{ $match: { ...base, status: 'Paid', verifiedAt: { $ne: null } } }, { $group: { _id: '$plan', amount: { $sum: '$amount' }, count: { $sum: 1 } } }, { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } }])
    ]),
    paid = summary.find((x) => x._id === 'Paid'),
    refunded = summary.find((x) => x._id === 'Refunded'),
    failed = summary.find((x) => x._id === 'Failed');
  ok(res, { range, from, to: now, totalCaptured: paid?.amount || 0, totalRefunded: refunded?.amount || 0, netCaptured: (paid?.amount || 0) - (refunded?.amount || 0), paymentCount: paid?.count || 0, failedCount: failed?.count || 0, daily: daily.map((x) => ({ date: x._id, amount: x.amount, count: x.count })), revenueByPlan: byPlan.map((x) => ({ plan: x.plan[0]?.name || 'Historical plan', amount: x.amount, count: x.count })) });
});

export const customers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req), query = { role: 'member' };
  if (req.query.status) query.status = String(req.query.status);
  if (req.query.search) {
    const re = escapedRegex(req.query.search),
      profiles = await MatrimonialProfile.find({ $or: [{ profileId: re }, { firstName: re }, { lastName: re }] }).select('userId').limit(100).lean(),
      paymentUsers = req.user.role === 'super_admin'
        ? await Payment.find({ $or: [{ providerOrderId: re }, { providerPaymentId: re }] }).distinct('user')
        : [];
    query.$or = [{ email: re }, { phone: re }, { _id: { $in: [...profiles.map((x) => x.userId), ...paymentUsers] } }];
  }
  const [users, total] = await Promise.all([User.find(query).sort('-createdAt').skip(skip).limit(limit).lean(), User.countDocuments(query)]),
    ids = users.map((x) => x._id),
    [profiles, subscriptions] = await Promise.all([
      MatrimonialProfile.find({ userId: { $in: ids } }).select('userId profileId firstName lastName visibility verification lastActiveAt').lean(),
      Subscription.find({ user: { $in: ids }, status: 'Active' }).populate('plan', 'name slug').sort('-endsAt').lean()
    ]),
    items = users.map((user) => ({ ...user, profile: profiles.find((x) => String(x.userId) === String(user._id)) || null, subscription: subscriptions.find((x) => String(x.user) === String(user._id)) || null }));
  ok(res, paginated(items, total, page, limit));
});

export const customer = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new ApiError(404, 'Customer not found.');
  const profile = await MatrimonialProfile.findOne({ userId: user._id }).lean(), profileId = profile?._id;
  const [subscriptions, payments, tickets, notes, audit, assignment, interests, matches, shortlists, views, contactRequests, reportsSubmitted] = await Promise.all([
    Subscription.find({ user: user._id }).populate('plan', 'name slug').sort('-createdAt').lean(),
    Payment.find({ user: user._id }).populate('plan', 'name slug').sort('-createdAt').lean(),
    SupportTicket.find({ $or: [{ user: user._id }, { email: user.email }] }).populate('assignedTo', 'email role').sort('-createdAt').lean(),
    CustomerNote.find({ user: user._id }).populate('author', 'email role').sort('-createdAt').lean(),
    AuditLog.find({ entityId: String(user._id) }).populate('actor', 'email role').sort('-createdAt').limit(100).lean(),
    RelationshipManagerAssignment.findOne({ user: user._id }).populate('manager', 'email phone').lean(),
    profileId ? Interest.countDocuments({ $or: [{ senderProfile: profileId }, { receiverProfile: profileId }] }) : 0,
    profileId ? Match.countDocuments({ $or: [{ profileA: profileId }, { profileB: profileId }] }) : 0,
    profileId ? Shortlist.countDocuments({ userProfile: profileId }) : 0,
    profileId ? ProfileView.countDocuments({ viewedProfile: profileId }) : 0,
    profileId ? ContactRequest.countDocuments({ $or: [{ requesterProfile: profileId }, { receiverProfile: profileId }] }) : 0,
    Report.countDocuments({ reporter: user._id })
  ]);
  ok(res, { user, profile, subscriptions, payments, tickets, notes, audit, assignment, activity: { interests, matches, shortlists, views, contactRequests }, safety: { reportsSubmitted } });
});

export const addCustomerNote = asyncHandler(async (req, res) => {
  validId(req.params.id);
  if (!(await User.exists({ _id: req.params.id }))) throw new ApiError(404, 'Customer not found.');
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) throw new ApiError(400, 'A note is required.');
  const note = await CustomerNote.create({ user: req.params.id, author: req.user.id, text, category: req.body.category || 'General' });
  await AuditLog.create({ actor: req.user.id, action: 'customer.note.created', entityType: 'User', entityId: req.params.id, metadata: { noteId: String(note._id), category: note.category }, requestId: req.id });
  await note.populate('author', 'email role');
  ok(res, { note }, 'Internal note added.', 201);
});

export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return ok(res, { customers: [], profiles: [], payments: [], supportTickets: [] });
  const re = escapedRegex(q), [customers, profiles, payments, supportTickets] = await Promise.all([
    User.find({ $or: [{ email: re }, { phone: re }] }).select('email phone status').limit(8).lean(),
    MatrimonialProfile.find({ $or: [{ profileId: re }, { firstName: re }, { lastName: re }] }).select('userId profileId firstName lastName visibility').limit(8).lean(),
    Payment.find({ $or: [{ providerOrderId: re }, { providerPaymentId: re }] }).populate('user', 'email phone').select('user providerOrderId providerPaymentId amount status').limit(8).lean(),
    SupportTicket.find({ $or: [{ email: re }, { phone: re }, { name: re }] }).select('user name email category status').limit(8).lean()
  ]);
  ok(res, { customers, profiles, payments, supportTickets });
});

export const managerWorkspace = asyncHandler(async (req, res) => {
  const assignments = await RelationshipManagerAssignment.find({ manager: req.user.id, status: 'Active' }).populate('user', 'email phone status').sort('-updatedAt').lean(), ids = assignments.map((x) => x.user?._id).filter(Boolean),
    [profiles, subscriptions, notes] = await Promise.all([
      MatrimonialProfile.find({ userId: { $in: ids } }).select('userId profileId firstName lastName visibility lastActiveAt location').lean(),
      Subscription.find({ user: { $in: ids }, status: 'Active' }).populate('plan', 'name').lean(),
      CustomerNote.find({ user: { $in: ids } }).sort('-createdAt').lean()
    ]);
  ok(res, { clients: assignments.map((a) => ({ ...a, profile: profiles.find((x) => String(x.userId) === String(a.user._id)) || null, subscription: subscriptions.find((x) => String(x.user) === String(a.user._id)) || null, latestNote: notes.find((x) => String(x.user) === String(a.user._id)) || null })) });
});
export const systemHealth = asyncHandler(async (_req, res) => {
  const settings = await getSystemSettings(),
    providers = providerDiagnostics();
  ok(res, {
    api: {
      status: 'Available',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'Available' : 'Unavailable'
    },
    platform: {
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
      paymentsEnabled: settings.paymentsEnabled
    },
    providers: Object.fromEntries(
      Object.entries(providers).map(([key, value]) => [
        key,
        {
          name: value.name,
          status: value.configured ? 'Configured' : 'Not configured'
        }
      ])
    )
  });
});
export const profiles = asyncHandler(async (req, res) => {
  const query = req.query.status
    ? { visibility: String(req.query.status) }
    : {};
  ok(res, {
    profiles: await MatrimonialProfile.find(query)
      .populate('userId', 'email phone status')
      .sort('-createdAt')
      .limit(100)
  });
});
export const profile = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const record = await MatrimonialProfile.findById(req.params.id).populate(
    'userId',
    'email phone status role'
  );
  if (!record) throw new ApiError(404, 'Profile not found.');
  ok(res, { profile: await serializeProfileForViewer(record, req.user) });
});
export const moderate = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const map = {
      approve: 'active',
      reject: 'rejected',
      changes: 'changes_required',
      suspend: 'hidden'
    },
    status = map[req.params.action];
  if (!status) throw new ApiError(400, 'Invalid moderation action.');
  const notes =
      typeof req.body.notes === 'string' ? req.body.notes.slice(0, 2000) : '',
    record = await MatrimonialProfile.findByIdAndUpdate(
      req.params.id,
      {
        visibility: status,
        moderationNotes: notes,
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        ...(status === 'active' ? { 'verification.adminVerified': true } : {})
      },
      { returnDocument: 'after' }
    );
  if (!record) throw new ApiError(404, 'Profile not found.');
  const type = status === 'active' ? 'PROFILE_APPROVED' : 'PROFILE_REJECTED',
    title =
      status === 'active'
        ? 'Profile approved'
        : status === 'changes_required'
          ? 'Profile changes requested'
          : 'Profile moderation update';
  await Promise.all([
    Notification.create({
      user: record.userId,
      type,
      title,
      message: notes || `Your profile is now ${status.replace('_', ' ')}.`,
      relatedProfile: record._id
    }),
    AuditLog.create({
      actor: req.user.id,
      action: `profile.${req.params.action}`,
      entityType: 'MatrimonialProfile',
      entityId: String(record._id),
      metadata: { status, notes },
      requestId: req.id
    }),
    emailUser(record.userId, {
      subject: title,
      template: 'profile-moderation',
      data: { status, notes }
    })
  ]);
  ok(res, { profile: record }, 'Moderation decision saved.');
});
export const plans = asyncHandler(async (_req, res) =>
  ok(res, { plans: await Plan.find({ active: true }).sort('price') })
);
export const users = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = String(req.query.status);
  if (req.query.role) query.role = String(req.query.role);
  if (req.query.search)
    query.$or = [
      { email: escapedRegex(req.query.search) },
      { phone: escapedRegex(req.query.search) }
    ];
  ok(res, { users: await User.find(query).sort('-createdAt').limit(100) });
});
export const updateUser = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'User not found.');
  const previous = { role: target.role, status: target.status },
    roles = [
      'member',
      'moderator',
      'admin',
      'relationship_manager',
      'super_admin'
    ],
    statuses = ['Active', 'Suspended', 'Blocked'];
  if (req.body.role !== undefined) {
    if (req.user.role !== 'super_admin')
      throw new ApiError(403, 'Only a super admin can manage roles.');
    if (!roles.includes(req.body.role))
      throw new ApiError(400, 'Invalid role.');
    if (
      target.role === 'super_admin' &&
      req.body.role !== 'super_admin' &&
      (await User.countDocuments({ role: 'super_admin', status: 'Active' })) <=
        1
    )
      throw new ApiError(409, 'The last active super admin cannot be demoted.');
    target.role = req.body.role;
  }
  if (req.body.status !== undefined) {
    if (!statuses.includes(req.body.status))
      throw new ApiError(400, 'Invalid account status.');
    if (target._id.equals(req.user._id) && req.body.status !== 'Active')
      throw new ApiError(409, 'You cannot disable your own signed-in account.');
    if (
      target.role === 'super_admin' &&
      target.status === 'Active' &&
      req.body.status !== 'Active' &&
      (await User.countDocuments({ role: 'super_admin', status: 'Active' })) <=
        1
    )
      throw new ApiError(
        409,
        'The last active super admin cannot be disabled.'
      );
    if (
      req.body.status !== 'Active' &&
      (typeof req.body.reason !== 'string' || req.body.reason.trim().length < 5)
    )
      throw new ApiError(400, 'A reason of at least 5 characters is required.');
    target.status = req.body.status;
  }
  await target.save();
  await AuditLog.create({
    actor: req.user.id,
    action:
      previous.role !== target.role
        ? 'role.changed'
        : `user.${target.status.toLowerCase()}`,
    entityType: 'User',
    entityId: String(target._id),
    metadata: {
      previous,
      current: { role: target.role, status: target.status },
      reason:
        typeof req.body.reason === 'string'
          ? req.body.reason.trim().slice(0, 1000)
          : undefined
    },
    requestId: req.id
  });
  if (previous.role !== target.role || previous.status !== target.status)
    await emailUser(target._id, {
      security: true,
      subject: 'Your account access was updated',
      template: 'account-access-updated',
      data: { role: target.role, status: target.status }
    });
  ok(res, { user: target }, 'User updated.');
});
export const reports = asyncHandler(async (req, res) =>
  ok(res, {
    reports: await Report.find(
      req.query.status ? { status: String(req.query.status) } : {}
    )
      .populate('reporter', 'email phone')
      .populate('reportedProfile', 'profileId firstName lastName')
      .sort('-createdAt')
  })
);
export const updateReport = asyncHandler(async (req, res) => {
  validId(req.params.id);
  if (!['Reviewed', 'Resolved', 'Dismissed'].includes(req.body.status))
    throw new ApiError(400, 'Invalid report status.');
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after' }
  );
  if (!report) throw new ApiError(404, 'Report not found.');
  await AuditLog.create({
    actor: req.user.id,
    action: 'report.updated',
    entityType: 'Report',
    entityId: String(report._id),
    metadata: { status: report.status },
    requestId: req.id
  });
  ok(res, { report }, 'Report updated.');
});
export const subscriptions = asyncHandler(async (_req, res) => {
  const data = await Subscription.find()
      .populate('user', 'email phone')
      .populate('plan', 'name slug price')
      .sort('-createdAt')
      .lean(),
    payments = await Payment.find({
      subscription: { $in: data.map((item) => item._id) }
    }).lean();
  ok(res, {
    subscriptions: data.map((subscription) => ({
      ...subscription,
      payment:
        payments.find(
          (payment) => String(payment.subscription) === String(subscription._id)
        ) || null
    }))
  });
});
