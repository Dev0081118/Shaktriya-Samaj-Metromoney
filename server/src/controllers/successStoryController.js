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
