import { dispatchStoryEvent, storyAdminIds } from '../services/storyNotificationService.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import MatrimonialProfile from '../models/MatrimonialProfile.js';
import SuccessStory from '../models/SuccessStory.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';

const text = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength + 1) : '';

const profileName = (profile) => [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
const activeStoryStates = ['AwaitingConsent', 'PendingReview', 'ChangesRequested', 'Approved'];
const storyFields = (body) => ({
  city: text(body?.city, 120), title: text(body?.title, 140),
  story: text(body?.story, 3000)
});
const parseMarriageDate = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ApiError(400, 'Marriage date must be YYYY-MM-DD.');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date > new Date()) throw new ApiError(400, 'Marriage date is invalid or in the future.');
  return date;
};
const requireOwnProfile = async (userId) => {
  const profile = await MatrimonialProfile.findOne({ userId }).select('firstName lastName');
  if (!profile || profileName(profile).length < 2) throw new ApiError(400, 'Complete your registered matrimonial profile before submitting a success story.');
  return profile;
};


export const submitSuccessStory = asyncHandler(async (req, res) => {
  const ownProfile = await requireOwnProfile(req.user.id);
  const partnerOneName = profileName(ownProfile);
  const partnerTwoName = 'Awaiting verified partner';
  const { city, title, story } = storyFields(req.body);
  if (title.length < 8 || title.length > 140 || story.length < 80 || story.length > 3000 || city.length > 120) {
    throw new ApiError(400, 'Provide a title (8–140 characters) and story (80–3000 characters).');
  }
  if (req.body?.submitterConsent !== true) throw new ApiError(400, 'Your explicit consent is required.');
  const marriageDate = parseMarriageDate(req.body?.marriageDate);
  const existing = await SuccessStory.exists({ submittedBy: req.user.id, status: { $in: activeStoryStates } });
  if (existing) throw new ApiError(409, 'You already have an active success story. Edit your existing submission or contact support.');
  const record = await SuccessStory.create({
    submittedBy: req.user.id, partnerOneName, partnerTwoName, city, title, story,
    ...(marriageDate ? { marriageDate } : {}), submitterConsent: true,
    submitterConsentAt: new Date(), partnerConsentStatus: 'NotRequested', status: 'AwaitingConsent',
    photoConsentVerified: false, photo: ''
  });
  await dispatchStoryEvent({ userIds: await storyAdminIds(), type: 'STORY_SUBMITTED', title: 'New member success story', message: 'A new story awaits independent partner consent.', storyId: record._id, url: '/admin/success-stories' });
  ok(res, { story: { id: record.id, status: record.status, title: record.title } }, 'Your story was received. Invite your partner to verify their identity and consent.', 201);
});

export const mySuccessStories = asyncHandler(async (req, res) => {
  const records = await SuccessStory.find({ submittedBy: req.user.id })
    .select('partnerOneName partnerTwoName city title story marriageDate status createdAt updatedAt moderationNotes partnerConsentStatus')
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
  const partnerProfile = await MatrimonialProfile.findOne({ userId: partner._id }).select('firstName lastName');
  const verifiedPartnerName = profileName(partnerProfile);
  if (verifiedPartnerName.length < 2) throw new ApiError(400, 'Your partner must complete their registered matrimonial profile first.');
  record.partnerOneName = profileName(await requireOwnProfile(req.user.id));
  record.partnerTwoName = verifiedPartnerName;
  record.partnerUser = partner._id;
  record.partnerConsentStatus = 'Pending';
  record.partnerInvitedAt = new Date();
  record.partnerInviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  record.partnerConsentVerifiedAt = null;
  record.photoConsentVerified = false;
  await record.save();
  await dispatchStoryEvent({ userIds: [partner._id], type: 'STORY_INVITATION', title: 'Your consent is requested', message: 'A member has privately invited you to review a success story. Please review before consenting.', storyId: record._id, url: '/story-consent' });
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
  await dispatchStoryEvent({ userIds: [record.submittedBy, ...(decision === 'accept' ? await storyAdminIds() : [])], type: decision === 'accept' ? 'STORY_CONSENT_ACCEPTED' : 'STORY_CONSENT_DECLINED', title: decision === 'accept' ? 'Partner consent confirmed' : 'Partner declined story consent', message: decision === 'accept' ? 'Your story is now awaiting admin review.' : 'The partner declined to approve publication.', storyId: record._id, url: decision === 'accept' ? '/admin/success-stories' : '/story-consent' });
  ok(res, { story: { id: record.id, status: record.status, partnerConsentStatus: record.partnerConsentStatus } },
    decision === 'accept' ? 'Consent recorded. Story awaits admin review.' : 'Story invitation declined.');
});

export const reviseSuccessStory = asyncHandler(async (req, res) => {
  validStoryId(req.params.id);
  const { city, title, story } = storyFields(req.body);
  if (title.length < 8 || title.length > 140 || story.length < 80 || story.length > 3000 || city.length > 120) {
    throw new ApiError(400, 'Provide a valid title and story (minimum 80 characters).');
  }
  if (req.body?.submitterConsent !== true) throw new ApiError(400, 'Your renewed publication consent is required.');
  const marriageDate = parseMarriageDate(req.body?.marriageDate);
  // Compare-and-set prevents unauthorized editing or repeated resubmission.
  const record = await SuccessStory.findOneAndUpdate({
    _id: req.params.id, submittedBy: req.user.id, status: 'ChangesRequested'
  }, { $set: {
    city, title, story, marriageDate, status: 'AwaitingConsent',
    submittedBy: req.user.id, submitterConsent: true, submitterConsentAt: new Date(),
    partnerConsentStatus: 'NotRequested', partnerConsentVerifiedAt: null,
    partnerInvitedAt: null, partnerInviteExpiresAt: null, partnerConsentWithdrawnAt: null,
    photoConsentVerified: false, publishedAt: null, moderationNotes: ''
  } }, { returnDocument: 'after', runValidators: true });
  if (!record) throw new ApiError(409, 'Only your own ChangesRequested story can be revised.');
  // Updated narrative requires fresh independent partner consent.
  await dispatchStoryEvent({ userIds: await storyAdminIds(), type: 'STORY_RESUBMITTED',
    title: 'Story corrections resubmitted', message: 'A member revised a changes-requested story and must obtain fresh partner consent.',
    storyId: record._id, url: '/admin/success-stories' });
  ok(res, { story: { id: record.id, status: record.status } }, 'Corrections saved. Please invite your partner to consent to the revised story.');
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
  await dispatchStoryEvent({ userIds: [record.submittedBy, record.partnerUser, ...(await storyAdminIds())], type: 'STORY_WITHDRAWN', title: 'Story publication withdrawn', message: 'A success story has been withdrawn and is no longer eligible for public display.', storyId: record._id });
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
    .sort('-createdAt').limit(100)
    .populate({ path: 'submittedBy', select: 'email' }).lean();
  const ids = stories.map(item => item.submittedBy?._id).filter(Boolean);
  const profiles = await MatrimonialProfile.find({ userId: { $in: ids } }).select('userId firstName lastName').lean();
  const names = new Map(profiles.map(p => [String(p.userId), profileName(p)]));
  const results = stories.map(item => ({ ...item, submittedBy: undefined,
    submitter: { name: names.get(String(item.submittedBy?._id)) || item.partnerOneName,
      email: item.submittedBy?.email || 'Unavailable' } }));
  ok(res, { stories: results });
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
  await dispatchStoryEvent({ userIds: [story.submittedBy, story.partnerUser], type: action === 'approve' ? 'STORY_APPROVED' : action === 'reject' ? 'STORY_REJECTED' : 'STORY_CHANGES_REQUESTED', title: action === 'approve' ? 'Your success story was approved' : action === 'reject' ? 'Your story was not approved' : 'Changes requested for your story', message: action === 'approve' ? 'Your approved story may now appear publicly.' : 'Please review the moderation decision in your story consent centre.', storyId: story._id });
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
