import { Interest, Match } from '../models/Interaction.js';
import { Block } from '../models/Platform.js';
import { ContactRequest } from '../models/Business.js';
import { calculateAge } from '../utils/profile.js';
const allowed = (rule, { registered, accepted, matched }) =>
  rule === 'Everyone' ||
  (rule === 'RegisteredMembers' && registered) ||
  (rule === 'AcceptedInterests' && accepted) ||
  (rule === 'MutualMatches' && matched);
export async function relationshipContext(profile, viewer) {
  const owner =
      String(profile.userId?._id || profile.userId) === String(viewer._id),
    privileged = ['admin', 'moderator', 'super_admin'].includes(viewer.role);
  if (owner || privileged)
    return {
      owner,
      privileged,
      registered: true,
      accepted: true,
      matched: true,
      contactUnlocked: true,
      blocked: false
    };
  const viewerProfile = await profile.constructor
    .findOne({ userId: viewer._id })
    .select('_id');
  if (!viewerProfile)
    return { registered: true, blocked: false, contactUnlocked: false };
  const [blocked, accepted, matched, contactRequest] = await Promise.all([
    Block.exists({
      $or: [
        { user: viewer._id, blockedProfile: profile._id },
        {
          user: profile.userId?._id || profile.userId,
          blockedProfile: viewerProfile._id
        }
      ]
    }),
    Interest.exists({
      status: 'Accepted',
      $or: [
        { senderProfile: viewerProfile._id, receiverProfile: profile._id },
        { senderProfile: profile._id, receiverProfile: viewerProfile._id }
      ]
    }),
    Match.exists({
      pairKey: [String(viewerProfile._id), String(profile._id)]
        .sort()
        .join(':'),
      status: 'Active'
    }),
    ContactRequest.findOne({
      status: 'Accepted',
      $or: [
        { requesterProfile: viewerProfile._id, receiverProfile: profile._id },
        { requesterProfile: profile._id, receiverProfile: viewerProfile._id }
      ]
    }).lean()
  ]);
  const contactUnlocked =
    !!contactRequest &&
    (String(contactRequest.requesterProfile) === String(viewerProfile._id)
      ? !!contactRequest.requesterUnlockedAt
      : !!contactRequest.receiverUnlockedAt);
  return {
    owner: false,
    privileged: false,
    registered: true,
    accepted: !!accepted,
    matched: !!matched,
    contactUnlocked,
    blocked: !!blocked
  };
}
export async function serializeProfileForViewer(profile, viewer) {
  const p = profile.toObject ? profile.toObject() : structuredClone(profile),
    context = await relationshipContext(profile, viewer);
  if (context.blocked) return null;
  const privacy = p.privacy || {};
  p.age = calculateAge(p.dateOfBirth);
  delete p.dateOfBirth;
  delete p.moderatedBy;
  delete p.profilePhotoPublicId;
  if (!context.owner && !context.privileged) {
    if (!allowed(privacy.photoVisibility || 'RegisteredMembers', context)) {
      p.profilePhoto = null;
      p.gallery = [];
      p.galleryAssets = [];
    }
    if (!allowed(privacy.fullNameVisibility || 'RegisteredMembers', context)) {
      delete p.lastName;
      delete p.middleName;
    }
    if (!allowed(privacy.incomeVisibility || 'Private', context) && p.career)
      delete p.career.annualIncome;
    if (!allowed(privacy.familyVisibility || 'RegisteredMembers', context))
      delete p.family;
    if (context.contactUnlocked && p.userId && typeof p.userId === 'object')
      p.contact = {
        email: p.userId.email,
        phone: p.userId.phone,
        whatsappPhone: p.userId.phone?.replace(/\D/g, '')
      };
    delete p.userId;
  }
  return p;
}
