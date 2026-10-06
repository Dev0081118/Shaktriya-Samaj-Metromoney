import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import User from '../models/User.js';
import MatrimonialProfile from '../models/MatrimonialProfile.js';
import { Match } from '../models/Interaction.js';
import {
  SupportTicket,
  ContactRequest,
  NotificationPreference,
  SystemSetting,
  AuditLog,
  PasswordReset,
  ProfileBoost,
  RelationshipManagerAssignment
} from '../models/Business.js';
import {
  Notification,
  Plan,
  Payment,
  Subscription
} from '../models/Platform.js';
import { asyncHandler, ApiError, ok } from '../utils/http.js';
import { sendEmailSafely } from '../services/emailService.js';
import { emailUser } from '../services/notificationEmailService.js';
import {
  consumeEntitlement,
  getUserEntitlements
} from '../services/entitlementService.js';
import {
  getSystemSettings,
  providerDiagnostics
} from '../services/systemService.js';
const own = async (userId) => {
  const profile = await MatrimonialProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'Create your profile first.');
  return profile;
};
const validId = (value) => {
  if (!mongoose.isValidObjectId(value))
    throw new ApiError(400, 'Invalid record ID.');
};
export const publicSystemStatus = asyncHandler(async (_req, res) => {
  const settings = await getSystemSettings();
  ok(res, {
    maintenanceMode: settings.maintenanceMode,
    registrationEnabled: settings.registrationEnabled,
    paymentsEnabled: settings.paymentsEnabled,
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    defaultCountry: settings.defaultCountry,
    legalVersion: process.env.LEGAL_VERSION || 'development-draft',
    legalEffectiveDate: process.env.LEGAL_EFFECTIVE_DATE || null
  });
});
export const createSupport = asyncHandler(async (req, res) => {
  const { name, email, phone, category, message } = req.body;
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    !['Account', 'Profile', 'Payment', 'Safety', 'Technical', 'Other'].includes(
      category
    )
  )
    throw new ApiError(
      400,
      'Valid name, email, category and message are required.'
    );
  let priority = 'Normal';
  if (req.user) {
    const entitlements = await getUserEntitlements(req.user.id);
    if (entitlements.prioritySupport) priority = 'Priority';
  }
  const ticket = await SupportTicket.create({
    user: req.user?.id,
    name,
    email,
    phone: typeof phone === 'string' ? phone : undefined,
    category,
    message,
    priority
  });
  ok(res, { ticketId: ticket._id, priority }, 'Support request received.', 201);
});
export const support = asyncHandler(async (req, res) => {
  const query = {};
  if (
    req.query.status &&
    ['Open', 'In Progress', 'Resolved', 'Closed'].includes(req.query.status)
  )
    query.status = req.query.status;
  ok(res, {
    tickets: await SupportTicket.find(query)
      .populate('assignedTo', 'email role')
      .populate('user', 'email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(100)
  });
});
export const updateSupport = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const safe = {};
  if (['Open', 'In Progress', 'Resolved', 'Closed'].includes(req.body.status))
    safe.status = req.body.status;
  if (typeof req.body.resolutionNotes === 'string')
    safe.resolutionNotes = req.body.resolutionNotes;
  if (req.body.assignedTo) {
    validId(req.body.assignedTo);
    safe.assignedTo = req.body.assignedTo;
  }
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, safe, {
    returnDocument: 'after',
    runValidators: true
  });
  if (!ticket) throw new ApiError(404, 'Support ticket not found.');
  await AuditLog.create({
    actor: req.user.id,
    action: 'support.updated',
    entityType: 'SupportTicket',
    entityId: String(ticket._id),
    metadata: { status: ticket.status }
  });
  ok(res, { ticket }, 'Support ticket updated.');
});
export const createContactRequest = asyncHandler(async (req, res) => {
  validId(req.body.receiverProfile);
  const requester = await own(req.user.id),
    receiver = await MatrimonialProfile.findById(req.body.receiverProfile);
  if (!receiver || requester._id.equals(receiver._id))
    throw new ApiError(400, 'Contact request is not available.');
  const pairKey = [String(requester._id), String(receiver._id)]
    .sort()
    .join(':');
  if (!(await Match.exists({ pairKey, status: 'Active' })))
    throw new ApiError(
      403,
      'Contact details can be requested after a mutual match.'
    );
  const existing = await ContactRequest.findOne({
    requesterProfile: requester._id,
    receiverProfile: receiver._id
  });
  if (existing)
    return ok(res, { request: existing }, 'Contact request already exists.');
  const request = await ContactRequest.create({
    requesterProfile: requester._id,
    receiverProfile: receiver._id
  });
  await Notification.create({
    user: receiver.userId,
    type: 'SYSTEM',
    title: 'Contact request',
    message: `${requester.firstName}'s family requested contact details.`,
    relatedProfile: requester._id,
    relatedRecord: request._id
  });
  await emailUser(receiver.userId, {
    category: 'interest',
    subject: 'You received a contact request',
    template: 'contact-request-received',
    data: { from: requester.firstName }
  });
  ok(res, { request }, 'Contact request sent.', 201);
});
export const listContactRequests = asyncHandler(async (req, res) => {
  const profile = await own(req.user.id),
    incoming = req.params.side === 'incoming';
  if (!incoming && req.params.side !== 'outgoing')
    throw new ApiError(400, 'Request list must be incoming or outgoing.');
  const field = incoming ? 'receiverProfile' : 'requesterProfile',
    other = incoming ? 'requesterProfile' : 'receiverProfile',
    requests = await ContactRequest.find({ [field]: profile._id })
      .populate(
        other,
        'profileId firstName lastName profilePhoto location career'
      )
      .sort('-createdAt');
  ok(res, {
    requests: requests.map((item) => ({
      ...item.toObject(),
      profile: item[other],
      unlocked: incoming
        ? !!item.receiverUnlockedAt
        : !!item.requesterUnlockedAt
    }))
  });
});
export const updateContactRequest = asyncHandler(async (req, res) => {
  if (!['accept', 'decline'].includes(req.params.action))
    throw new ApiError(400, 'Invalid contact request action.');
  validId(req.params.id);
  const profile = await own(req.user.id),
    request = await ContactRequest.findOne({
      _id: req.params.id,
      receiverProfile: profile._id,
      status: 'Pending'
    });
  if (!request) throw new ApiError(404, 'Pending contact request not found.');
  request.status = req.params.action === 'accept' ? 'Accepted' : 'Declined';
  request.respondedAt = new Date();
  await request.save();
  const requester = await MatrimonialProfile.findById(request.requesterProfile);
  await Notification.create({
    user: requester.userId,
    type: 'SYSTEM',
    title: 'Contact request updated',
    message: `Your contact request was ${request.status.toLowerCase()}.`,
    relatedProfile: profile._id,
    relatedRecord: request._id
  });
  if (request.status === 'Accepted')
    await emailUser(requester.userId, {
      category: 'interest',
      subject: 'Your contact request was accepted',
      template: 'contact-accepted',
      data: { profile: profile.firstName }
    });
  ok(res, { request }, `Contact request ${request.status.toLowerCase()}.`);
});
export const unlockContact = asyncHandler(async (req, res) => {
  validId(req.params.id);
  const profile = await own(req.user.id),
    request = await ContactRequest.findOne({
      _id: req.params.id,
      status: 'Accepted',
      $or: [{ requesterProfile: profile._id }, { receiverProfile: profile._id }]
    });
  if (!request) throw new ApiError(404, 'Accepted contact request not found.');
  const field = request.requesterProfile.equals(profile._id)
    ? 'requesterUnlockedAt'
    : 'receiverUnlockedAt';
  if (request[field])
    return ok(
      res,
      { request, alreadyUnlocked: true },
      'Contact already unlocked.'
    );
  const claimed = await ContactRequest.findOneAndUpdate(
    { _id: request._id, [field]: null },
    { $set: { [field]: new Date() } },
    { returnDocument: 'after' }
  );
  if (!claimed)
    return ok(
      res,
      {
        request: await ContactRequest.findById(request._id),
        alreadyUnlocked: true
      },
      'Contact already unlocked.'
    );
  try {
    await consumeEntitlement(req.user.id, 'contactView');
  } catch (error) {
    await ContactRequest.updateOne(
      { _id: request._id },
      { $unset: { [field]: 1 } }
    );
    throw error;
  }
  ok(res, { request: claimed }, 'Contact details unlocked.');
});
export const getNotificationPreferences = asyncHandler(async (req, res) =>
  ok(res, {
    preferences:
      (await NotificationPreference.findOne({ user: req.user.id })) ||
      new NotificationPreference({ user: req.user.id })
  })
);
export const saveNotificationPreferences = asyncHandler(async (req, res) => {
  const safe = {};
  for (const key of [
    'emailInterests',
    'emailMatches',
    'emailPayments',
    'smsCritical',
    'whatsappFuture'
  ])
    if (typeof req.body[key] === 'boolean') safe[key] = req.body[key];
  ok(
    res,
    {
      preferences: await NotificationPreference.findOneAndUpdate(
        { user: req.user.id },
        { ...safe, user: req.user.id },
        { upsert: true, returnDocument: 'after' }
      )
    },
    'Notification preferences saved.'
  );
});
export const forgotPassword = asyncHandler(async (req, res) => {
  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
  const user = email && (await User.findOne({ email }));
  if (user) {
    const code = String(crypto.randomInt(100000, 1000000));
    await PasswordReset.deleteMany({ user: user._id });
    await PasswordReset.create({
      user: user._id,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    sendEmailSafely({
      to: user.email,
      subject: 'Your password reset code',
      template: 'password-reset',
      data: { code }
    });
    if (process.env.NODE_ENV !== 'production')
      console.info(`[development reset code] ${user.email}: ${code}`);
  }
  ok(res, {}, 'If an account exists, a reset code has been sent.');
});
export const resetPassword =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const email =
        typeof req.body.email ===
        'string'
          ? req.body.email
              .trim()
              .toLowerCase()
          : '';

      const user =
        email &&
        (
          await User.findOne({
            email
          }).select(
            '+password'
          )
        );

      const record =
        user &&
        (
          await PasswordReset.findOne({
            user:
              user._id,

            usedAt:
              null
          }).sort(
            '-createdAt'
          )
        );

      if (
        !record ||
        record.expiresAt <
          Date.now()
      ) {
        throw new ApiError(
          400,
          'The reset code is invalid or expired.'
        );
      }

      record.attempts +=
        1;

      if (
        record.attempts >
        5
      ) {
        await record.save();

        throw new ApiError(
          429,
          'Too many reset attempts.'
        );
      }

      if (
        !(
          await bcrypt.compare(
            String(
              req.body.code ||
                ''
            ),

            record.codeHash
          )
        )
      ) {
        await record.save();

        throw new ApiError(
          400,
          'The reset code is invalid or expired.'
        );
      }

      const newPassword =
        req.body.newPassword;

      if (
        !newPassword ||
        newPassword.length <
          8
      ) {
        throw new ApiError(
          400,
          'New password must be at least 8 characters.'
        );
      }

      if (
        await user.comparePassword(
          newPassword
        )
      ) {
        throw new ApiError(
          400,
          'New password must be different from your current password.'
        );
      }

      user.password =
        newPassword;

      user.tokenVersion =
        Number(
          user.tokenVersion ??
            0
        ) + 1;

      record.usedAt =
        new Date();

      await Promise.all([
        user.save(),
        record.save()
      ]);

      /*
       * Remove any older unused reset codes.
       */
      await PasswordReset.deleteMany({
        user:
          user._id,

        usedAt:
          null
      });

      await emailUser(
        user._id,
        {
          security:
            true,

          subject:
            'Your password was changed',

          template:
            'password-changed',

          data: {
            changedAt:
              new Date()
                .toISOString()
          }
        }
      );

      ok(
        res,
        {},
        'Password reset successfully. Please sign in again.'
      );
    }
  );
export const settings = asyncHandler(async (_req, res) =>
  ok(res, {
    settings: await getSystemSettings(),
    providers: providerDiagnostics()
  })
);
export const saveSettings = asyncHandler(async (req, res) => {
  const safe = {};
  for (const key of [
    'platformName',
    'supportEmail',
    'supportPhone',
    'maintenanceMode',
    'registrationEnabled',
    'paymentsEnabled',
    'maxPhotos',
    'defaultCountry'
  ])
    if (req.body[key] !== undefined) safe[key] = req.body[key];
  if (
    safe.maxPhotos !== undefined &&
    (Number(safe.maxPhotos) < 1 || Number(safe.maxPhotos) > 20)
  )
    throw new ApiError(400, 'Maximum photos must be between 1 and 20.');
  const settings = await SystemSetting.findByIdAndUpdate('global', safe, {
    upsert: true,
    returnDocument: 'after',
    runValidators: true
  });
  await AuditLog.create({
    actor: req.user.id,
    action: 'system.settings.updated',
    entityType: 'SystemSetting',
    entityId: 'global',
    metadata: { fields: Object.keys(safe) }
  });
  ok(res, { settings }, 'System settings updated.');
});
export const auditLogs = asyncHandler(async (_req, res) =>
  ok(res, {
    logs: await AuditLog.find()
      .populate('actor', 'email role')
      .sort('-createdAt')
      .limit(200)
  })
);
export const payments = asyncHandler(async (_req, res) =>
  ok(res, {
    payments: await Payment.find()
      .populate('user', 'email phone')
      .populate('plan', 'name slug')
      .sort('-createdAt')
      .limit(200)
  })
);
export const allPlans = asyncHandler(async (_req, res) =>
  ok(res, { plans: await Plan.find().sort('price') })
);
export const managePlans = asyncHandler(async (req, res) => {
  const creating = !req.params.id;
  if (!creating) validId(req.params.id);
  const name =
      typeof req.body.name === 'string' ? req.body.name.trim() : undefined,
    slug =
      typeof req.body.slug === 'string'
        ? req.body.slug.trim().toLowerCase()
        : undefined,
    price = req.body.price === undefined ? undefined : Number(req.body.price),
    durationDays =
      req.body.durationDays === undefined
        ? undefined
        : Number(req.body.durationDays);
  if (
    creating &&
    (!name || !slug || price === undefined || durationDays === undefined)
  )
    throw new ApiError(400, 'Name, slug, price and duration are required.');
  if (slug && !/^[a-z0-9-]+$/.test(slug))
    throw new ApiError(
      400,
      'Plan slug may contain lowercase letters, numbers and hyphens only.'
    );
  if (price !== undefined && price < 0)
    throw new ApiError(400, 'Plan price cannot be negative.');
  if (durationDays !== undefined && durationDays <= 0)
    throw new ApiError(400, 'Plan duration must be greater than zero.');
  const safe = {};
  for (const [key, value] of Object.entries({
    name,
    slug,
    price,
    durationDays,
    active: req.body.active
  }))
    if (value !== undefined) safe[key] = value;
  if (
    req.body.features &&
    typeof req.body.features === 'object' &&
    !Array.isArray(req.body.features)
  ) {
    safe.features = {};
    for (const key of ['interestLimit', 'contactViewLimit', 'messageLimit']) {
      const value = Number(req.body.features[key] ?? 0);
      if (value < 0) throw new ApiError(400, 'Plan limits cannot be negative.');
      safe.features[key] = value;
    }
    for (const key of [
      'advancedSearch',
      'profileBoost',
      'prioritySupport',
      'relationshipManager'
    ])
      safe.features[key] = req.body.features[key] === true;
  }
  const plan = creating
    ? await Plan.create(safe)
    : await Plan.findByIdAndUpdate(req.params.id, safe, {
        returnDocument: 'after',
        runValidators: true
      });
  if (!plan) throw new ApiError(404, 'Plan not found.');
  await AuditLog.create({
    actor: req.user.id,
    action: creating ? 'plan.created' : 'plan.updated',
    entityType: 'Plan',
    entityId: String(plan._id),
    metadata: { name: plan.name, active: plan.active }
  });
  ok(res, { plan }, 'Plan saved.', creating ? 201 : 200);
});
export const boostStatus = asyncHandler(async (req, res) => {
  const profile = await own(req.user.id),
    latest = await ProfileBoost.findOne({ profile: profile._id }).sort(
      '-createdAt'
    );
  ok(res, {
    active: !!(profile.boostedUntil && profile.boostedUntil > Date.now()),
    activeUntil: profile.boostedUntil || null,
    nextEligibleAt: latest
      ? new Date(latest.startsAt.getTime() + 7 * 864e5)
      : null
  });
});
export const activateBoost = asyncHandler(async (req, res) => {
  const entitlements = await getUserEntitlements(req.user.id);
  if (!entitlements.profileBoost)
    throw new ApiError(
      403,
      'Profile boost is included with Premium membership.'
    );
  const profile = await own(req.user.id),
    latest = await ProfileBoost.findOne({ profile: profile._id }).sort(
      '-createdAt'
    ),
    now = new Date();
  if (profile.boostedUntil && profile.boostedUntil > now)
    throw new ApiError(409, 'Your profile boost is already active.');
  if (latest && latest.startsAt.getTime() + 7 * 864e5 > now.getTime())
    throw new ApiError(
      429,
      'Profile boost is available once every seven days.'
    );
  const endsAt = new Date(now.getTime() + 864e5),
    boost = await ProfileBoost.create({
      profile: profile._id,
      startsAt: now,
      endsAt
    });
  profile.boostedUntil = endsAt;
  profile.lastBoostAt = now;
  await profile.save();
  ok(res, { boost, activeUntil: endsAt }, 'Profile boost activated.', 201);
});
export const myManager = asyncHandler(async (req, res) => {
  const entitlements = await getUserEntitlements(req.user.id);
  if (!entitlements.relationshipManager)
    return ok(res, { included: false, assignment: null });
  const assignment = await RelationshipManagerAssignment.findOne({
    user: req.user.id,
    status: 'Active'
  }).populate('manager', 'email phone');
  ok(res, { included: true, assignment });
});
export const managers = asyncHandler(async (_req, res) =>
  ok(res, {
    managers: await User.find({
      role: 'relationship_manager',
      status: 'Active'
    }).select('email phone'),
    members: await User.find({ role: 'member', status: 'Active' })
      .select('email phone')
      .sort('email'),
    assignments: await RelationshipManagerAssignment.find()
      .populate('user', 'email')
      .populate('manager', 'email phone')
      .sort('-assignedAt')
  })
);
export const assignManager = asyncHandler(async (req, res) => {
  validId(req.body.user);
  validId(req.body.manager);
  const [manager, member] = await Promise.all([
    User.findOne({
      _id: req.body.manager,
      role: 'relationship_manager',
      status: 'Active'
    }),
    User.findOne({ _id: req.body.user, role: 'member', status: 'Active' })
  ]);
  if (!manager)
    throw new ApiError(400, 'Choose an active relationship manager.');
  if (!member) throw new ApiError(400, 'Choose an active member.');
  if (!(await getUserEntitlements(member._id)).relationshipManager)
    throw new ApiError(
      403,
      'Relationship managers can be assigned only to an eligible Assisted member.'
    );
  const assignment = await RelationshipManagerAssignment.findOneAndUpdate(
    { user: member._id },
    {
      user: member._id,
      manager: manager._id,
      assignedAt: new Date(),
      status: 'Active',
      notes:
        typeof req.body.notes === 'string'
          ? req.body.notes.slice(0, 2000)
          : undefined
    },
    { upsert: true, returnDocument: 'after' }
  );
  await AuditLog.create({
    actor: req.user.id,
    action: 'relationship-manager.assigned',
    entityType: 'User',
    entityId: String(member._id),
    metadata: { manager: String(manager._id) },
    requestId: req.id
  });
  ok(res, { assignment }, 'Relationship manager assigned.');
});
export const deleteAccount = asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findOne({ userId: req.user.id });
  if (profile) {
    profile.visibility = 'hidden';
    profile.lifecycleStatus = 'Deleted';
    await profile.save();
  }
  req.user.status = 'Deleted';
  req.user.email = `deleted-${req.user._id}@invalid.local`;
  req.user.phone = undefined;
  await req.user.save();
  ok(res, {}, 'Account closed and profile removed from discovery.');
});
export const setLifecycle = asyncHandler(async (req, res) => {
  if (!['Active', 'Paused', 'Married'].includes(req.body.status))
    throw new ApiError(400, 'Invalid lifecycle status.');
  const profile = await own(req.user.id);
  profile.lifecycleStatus = req.body.status;
  if (req.body.status === 'Married') profile.visibility = 'hidden';
  else if (req.body.status === 'Paused') profile.visibility = 'paused';
  else if (profile.visibility === 'paused') profile.visibility = 'active';
  await profile.save();
  ok(
    res,
    { status: profile.lifecycleStatus, visibility: profile.visibility },
    'Profile lifecycle updated.'
  );
});
export const expireSubscriptions = async () => {
  const now = new Date();
  await Subscription.updateMany(
    { status: 'Active', endsAt: { $lte: now } },
    { $set: { status: 'Expired' } }
  );
  return Subscription.find({
    status: 'Active',
    endsAt: { $gt: now, $lte: new Date(now.getTime() + 7 * 864e5) }
  }).populate('plan user');
};
