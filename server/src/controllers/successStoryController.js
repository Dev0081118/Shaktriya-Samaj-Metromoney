import mongoose from 'mongoose';
import User from '../models/User.js';
import SuccessStory from '../models/SuccessStory.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';

const text = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength + 1) : '';

export const submitSuccessStory = asyncHandler(async (req, res) => {
  const partnerOneName = text(req.body?.partnerOneName, 100);
  const partnerTwoName = text(req.body?.partnerTwoName, 100);
  const city = text(req.body?.city, 120);
  const title = text(req.body?.title, 140);
  const story = text(req.body?.story, 3000);
  const marriageDate = req.body?.marriageDate;
  if (partnerOneName.length < 2 || partnerOneName.length > 100 || partnerTwoName.length < 2 || partnerTwoName.length > 100 || title.length < 8 || title.length > 140 || story.length < 80 || story.length > 3000 || city.length > 120) {
    throw new ApiError(400, 'Please provide valid names, title (8–140 characters), and story (80–3000 characters).');
  }
  if (req.body?.submitterConsent !== true) {
    throw new ApiError(400, 'Your explicit consent to submit this story is required.');
  }
  let validMarriageDate;
  if (marriageDate !== undefined && marriageDate !== null && marriageDate !== '') {
    if (typeof marriageDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(marriageDate)) {
      throw new ApiError(400, 'Marriage date must be YYYY-MM-DD.');
    }
    validMarriageDate = new Date(`${marriageDate}T00:00:00.000Z`);
    if (Number.isNaN(validMarriageDate.getTime()) || validMarriageDate.toISOString().slice(0, 10) !== marriageDate || validMarriageDate > new Date()) {
      throw new ApiError(400, 'Marriage date is invalid or in the future.');
    }
  }
  // Only explicitly whitelisted fields are persisted; client cannot set status, consent verification or photo.
  const record = await SuccessStory.create({
    submittedBy: req.user.id,
    partnerOneName, partnerTwoName, city, title, story,
    ...(validMarriageDate ? { marriageDate: validMarriageDate } : {}),
    submitterConsent: true,
    submitterConsentAt: new Date(),
    partnerConsentStatus: 'NotRequested',
    status: 'AwaitingConsent',
    photoConsentVerified: false,
    photo: ''
  });
  ok(res, { story: { id: record.id, status: record.status, title: record.title } }, 'Your story was received. It will not be published without independent consent verification and admin approval.', 201);
});

export const mySuccessStories = asyncHandler(async (req, res) => {
  const records = await SuccessStory.find({ submittedBy: req.user.id })
    .select('partnerOneName partnerTwoName city title story marriageDate status createdAt updatedAt moderationNotes')
    .sort('-createdAt').limit(50).lean();
  ok(res, { stories: records });
});

// TASK-003C-1: consent belongs exclusively to a distinct, verified member account.
// Never rely on a checkbox submitted by the story's creator as partner approval.
const validStoryId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid story ID.');
};

export const inviteStoryPartner = asyncHandler(async (req, res) => {
  validStoryId(req.params.id);
  const email = typeof req.body?.partnerEmail === 'string'
    ? req.body.partnerEmail.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new ApiError(400, 'Provide your partner’s registered email address.');
  }
  const record = await SuccessStory.findOne({ _id: req.params.id, submittedBy: req.user.id });
  if (!record) throw new ApiError(404, 'Story not found.');
  if (record.status !== 'AwaitingConsent' || record.partnerConsentStatus === 'Verified') {
    throw new ApiError(409, 'This story cannot be invited in its current state.');
  }
  const partner = await User.findOne({ email, role: 'member', status: 'Active', emailVerified: true })
    .select('_id');
  if (!partner || String(partner._id) === String(req.user.id)) {
    // Avoid exposing whether a registered account exists.
    throw new ApiError(400, 'Partner must have a separate active, email-verified member account.');
  }
  // Prevent silent reassignment to another partner after any response.
  if (record.partnerUser && String(record.partnerUser) !== String(partner._id)) {
    throw new ApiError(409, 'Partner is already assigned. Contact support to correct the submission.');
  }
  record.partnerUser = partner._id;
  record.partnerConsentStatus = 'Pending';
  record.partnerInvitedAt = new Date();
  record.partnerInviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  record.partnerConsentVerifiedAt = null;
  record.photoConsentVerified = false;
  await record.save();
  ok(res, { story: { id: record.id, partnerConsentStatus: record.partnerConsentStatus, inviteExpiresAt: record.partnerInviteExpiresAt } }, 'Invitation is ready in your partner’s member account.');
});

export const myStoryConsentInvitations = asyncHandler(async (req, res) => {
  // Only independently email-verified members see their private invitations.
  const user = await User.findById(req.user.id).select('emailVerified');
  if (!user?.emailVerified) throw new ApiError(403, 'Verify your email to review story invitations.');
  const records = await SuccessStory.find({ partnerUser: req.user.id, partnerConsentStatus: 'Pending', status: 'AwaitingConsent' })
    .select('partnerOneName partnerTwoName title story city marriageDate partnerInviteExpiresAt createdAt')
    .sort('-createdAt').limit(30).lean();
  ok(res, { invitations: records.filter((record) => record.partnerInviteExpiresAt > new Date()) });
});

export const respondStoryConsent = asyncHandler(async (req, res) => {
  validStoryId(req.params.id);
  const decision = req.body?.decision;
  if (!['accept', 'decline'].includes(decision) || typeof req.body?.photoConsent !== 'boolean') {
    throw new ApiError(400, 'Provide accept/decline and an explicit photo consent choice.');
  }
  const user = await User.findById(req.user.id).select('emailVerified');
  if (!user?.emailVerified) throw new ApiError(403, 'Verify your email before consenting.');
  const now = new Date();
  const update = decision === 'accept' ? {
    partnerConsentStatus: 'Verified', partnerConsentVerifiedAt: now,
    status: 'PendingReview', photoConsentVerified: req.body.photoConsent
  } : {
    partnerConsentStatus: 'Declined', partnerConsentVerifiedAt: null,
    status: 'AwaitingConsent', photoConsentVerified: false
  };
  // Atomic compare-and-set guarantees only the intended partner can approve once,
  // only before expiration, and only while the story is awaiting consent.
  const record = await SuccessStory.findOneAndUpdate({
    _id: req.params.id, partnerUser: req.user.id, partnerConsentStatus: 'Pending',
    status: 'AwaitingConsent', partnerInviteExpiresAt: { $gt: now },
    submittedBy: { $ne: req.user.id }
  }, { $set: update }, { returnDocument: 'after', runValidators: true });
  if (!record) throw new ApiError(404, 'No active consent invitation was found.');
  ok(res, { story: { id: record.id, status: record.status, partnerConsentStatus: record.partnerConsentStatus } },
    decision === 'accept' ? 'Consent recorded. Story awaits admin review.' : 'Story invitation declined.');
});

export const withdrawStoryConsent = asyncHandler(async (req, res) => {
  validStoryId(req.params.id);
  const now = new Date();
  // Both original submitter and partner can withdraw. Terminal withdrawal means
  // even a previously published story is not eligible for public display.
  const record = await SuccessStory.findOneAndUpdate({
    _id: req.params.id,
    $or: [{ submittedBy: req.user.id }, { partnerUser: req.user.id }],
    status: { $ne: 'Withdrawn' }
  }, { $set: {
    status: 'Withdrawn', publishedAt: null, photoConsentVerified: false,
    partnerConsentStatus: 'Withdrawn', partnerConsentVerifiedAt: null,
    partnerConsentWithdrawnAt: now
  } }, { returnDocument: 'after', runValidators: true });
  if (!record) throw new ApiError(404, 'Active story not found or already withdrawn.');
  ok(res, { story: { id: record.id, status: record.status } }, 'Story withdrawn and unpublished.');
});


// TASK-003C-3: admin-only moderation. Public output must never contain
// partner account identifiers, email addresses, or unpublished story content.
export const adminListSuccessStories = asyncHandler(async (req, res) => {
  const allowed = ['AwaitingConsent', 'PendingReview', 'ChangesRequested', 'Approved', 'Rejected', 'Withdrawn'];
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  if (status && !allowed.includes(status)) throw new ApiError(400, 'Invalid story status.');
  const stories = await SuccessStory.find(status ? { status } : {})
    .select('partnerOneName partnerTwoName city title story marriageDate status partnerConsentStatus partnerConsentVerifiedAt submitterConsent submitterConsentAt photoConsentVerified moderationNotes publishedAt createdAt updatedAt')
    .sort('-createdAt').limit(100).lean();
  ok(res, { stories });
});

export const adminModerateSuccessStory = asyncHandler(async (req, res) => {
  validStoryId(req.params.id);
  const action = req.body?.action;
  const notes = text(req.body?.notes, 1000);
  if (!['approve', 'reject', 'requestChanges'].includes(action)) {
    throw new ApiError(400, 'Choose approve, reject or requestChanges.');
  }
  if (notes.length > 1000 || (action !== 'approve' && notes.length < 10)) {
    throw new ApiError(400, 'Provide a moderation reason of 10–1000 characters.');
  }
  const now = new Date();
  const allowedStatus = action === 'approve' ? 'PendingReview' : { $in: ['PendingReview', 'AwaitingConsent', 'ChangesRequested'] };
  const filter = { _id: req.params.id, status: allowedStatus };
  if (action === 'approve') {
    Object.assign(filter, {
      submitterConsent: true,
      submitterConsentAt: { $ne: null },
      partnerUser: { $ne: null },
      partnerConsentStatus: 'Verified',
      partnerConsentVerifiedAt: { $ne: null },
      partnerConsentWithdrawnAt: null,
      $expr: { $ne: ['$submittedBy', '$partnerUser'] }
    });
  }
  const status = action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'ChangesRequested';
  const story = await SuccessStory.findOneAndUpdate(filter, {
    $set: { status, moderationNotes: notes, publishedAt: action === 'approve' ? now : null }
  }, { returnDocument: 'after', runValidators: true });
  if (!story) throw new ApiError(409, 'Story status or required consent changed. Refresh before moderating.');
  ok(res, { story: { id: story.id, status: story.status } }, 'Moderation decision recorded.');
});

export const publicApprovedSuccessStories = asyncHandler(async (_req, res) => {
  const stories = await SuccessStory.find({
    status: 'Approved', publishedAt: { $ne: null },
    submitterConsent: true, submitterConsentAt: { $ne: null },
    partnerUser: { $ne: null }, partnerConsentStatus: 'Verified',
    partnerConsentVerifiedAt: { $ne: null }, partnerConsentWithdrawnAt: null,
    $expr: { $ne: ['$submittedBy', '$partnerUser'] }
  }).select('partnerOneName partnerTwoName city title story marriageDate publishedAt -_id')
    .sort('-publishedAt').limit(30).lean();
  // No images are returned: submitter's separate photo consent is not yet implemented.
  ok(res, { stories });
});
