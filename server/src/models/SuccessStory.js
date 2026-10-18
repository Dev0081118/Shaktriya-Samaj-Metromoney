import mongoose from 'mongoose';

const successStorySchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  partnerOneName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  partnerTwoName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 120 },
  title: { type: String, required: true, trim: true, minlength: 8, maxlength: 140 },
  story: { type: String, required: true, trim: true, minlength: 80, maxlength: 3000 },
  marriageDate: { type: Date },
  submitterConsent: { type: Boolean, required: true, default: false },
  submitterConsentAt: { type: Date, default: null },
  partnerConsentStatus: { type: String, enum: ['NotRequested', 'Pending', 'Verified', 'Declined', 'Withdrawn'], default: 'NotRequested' },
  partnerConsentVerifiedAt: { type: Date, default: null },
  partnerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  partnerInvitedAt: { type: Date, default: null },
  partnerInviteExpiresAt: { type: Date, default: null },
  partnerConsentWithdrawnAt: { type: Date, default: null },
  status: { type: String, enum: ['AwaitingConsent', 'PendingReview', 'ChangesRequested', 'Approved', 'Rejected', 'Withdrawn'], default: 'AwaitingConsent', index: true },
  publishedAt: { type: Date, default: null },
  photo: { type: String, default: '' },
  photoConsentVerified: { type: Boolean, default: false },
  moderationNotes: { type: String, default: '' }
}, { timestamps: true, strict: 'throw' });

successStorySchema.index({ status: 1, publishedAt: -1 });
successStorySchema.index({ partnerUser: 1, partnerConsentStatus: 1, createdAt: -1 });
export default mongoose.models.SuccessStory || mongoose.model('SuccessStory', successStorySchema);
