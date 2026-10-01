import mongoose from 'mongoose';
import MatrimonialProfile from '../models/MatrimonialProfile.js';
import PartnerPreference from '../models/PartnerPreference.js';
import { Block } from '../models/Platform.js';
import { Interest, Shortlist } from '../models/Interaction.js';
import { ContactRequest, ProfileView } from '../models/Business.js';
import { asyncHandler, ApiError, ok } from '../utils/http.js';
import {
  completion,
  calculateCompatibility,
  profileCard
} from '../utils/profile.js';
import { serializeProfileForViewer } from '../services/profilePrivacy.js';
import { mediaService } from '../services/mediaService.js';
import { getSystemSettings } from '../services/systemService.js';

const owned = async (user, optional = false) => {
  const profile = await MatrimonialProfile.findOne({ userId: user }).populate(
    'userId',
    'email phone role'
  );
  if (!profile && optional) return null;
  if (!profile) throw new ApiError(404, 'Create your profile first.');
  return profile;
};
const pick = (source, keys) =>
  Object.fromEntries(
    keys
      .filter((key) => source?.[key] !== undefined)
      .map((key) => [key, source[key]])
  );
const profilePayload = (body) => {
  const safe = pick(body, [
    'profileFor',
    'firstName',
    'middleName',
    'lastName',
    'gender',
    'dateOfBirth',
    'height',
    'maritalStatus',
    'marriageTimeline',
    'aboutMe',
    'visibility'
  ]);
  for (const [key, fields] of Object.entries({
    location: ['city', 'district', 'state', 'country', 'nativePlace'],
    community: ['name', 'subCommunity', 'clan', 'familyOrigin'],
    education: [
      'highestEducation',
      'degree',
      'specialization',
      'college',
      'educationDetails'
    ],
    career: [
      'occupationType',
      'occupation',
      'designation',
      'companyName',
      'businessName',
      'annualIncome'
    ],
    lifestyle: ['diet', 'smoking', 'drinking', 'interests'],
    family: [
      'fatherName',
      'fatherOccupation',
      'motherName',
      'motherOccupation',
      'siblings',
      'familyType',
      'familyLocation',
      'familyDescription'
    ],
    privacy: [
      'photoVisibility',
      'contactVisibility',
      'incomeVisibility',
      'familyVisibility',
      'fullNameVisibility'
    ]
  }))
    if (body[key]) safe[key] = pick(body[key], fields);
  if (
    safe.visibility &&
    !['draft', 'pending_review', 'paused'].includes(safe.visibility)
  )
    delete safe.visibility;
  return safe;
};
const escapedRegex = (value) =>
  new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export const upsert = asyncHandler(async (req, res) => {
  const safe = profilePayload(req.body);
  if (safe.dateOfBirth) {
    const dob = new Date(safe.dateOfBirth),
      age = (Date.now() - dob) / (365.25 * 864e5);
    if (!Number.isFinite(age) || age < 18 || age > 80)
      throw new ApiError(
        400,
        'Date of birth must represent an age between 18 and 80.'
      );
  }
  if (
    safe.visibility === 'pending_review' &&
    (!safe.firstName || !safe.profileFor)
  )
    throw new ApiError(
      400,
      'Profile name and profile owner are required before review.'
    );
  let profile = await MatrimonialProfile.findOne({ userId: req.user.id });
  if (profile) {
    Object.assign(profile, safe);
    await profile.save();
  } else
    profile = await MatrimonialProfile.create({ ...safe, userId: req.user.id });
  const preference = await PartnerPreference.findOne({ profileId: profile.id });
  profile.completionPercentage = completion(profile, !!preference);
  profile.lastActiveAt = new Date();
  await profile.save();
  ok(
    res,
    {
      profile: await serializeProfileForViewer(
        await profile.populate('userId', 'email phone role'),
        req.user
      )
    },
    'Profile saved.',
    201
  );
});
export const mine = asyncHandler(async (req, res) => {
  const profile = await owned(req.user.id, req.query.optional === 'true');
  ok(res, {
    profile: profile
      ? await serializeProfileForViewer(profile, req.user)
      : null
  });
});

export const discover = asyncHandler(async (req, res) => {
  const mine = await MatrimonialProfile.findOne({ userId: req.user.id });
  if (!mine) throw new ApiError(404, 'Create your profile first.');
  const myPreference = await PartnerPreference.findOne({ profileId: mine._id });
  const myBlocked = await Block.find({ user: req.user.id }).distinct(
    'blockedProfile'
  );
  const blockedByUsers = await Block.find({
    blockedProfile: mine._id
  }).distinct('user');
  const blockedByProfiles = await MatrimonialProfile.find({
    userId: { $in: blockedByUsers }
  }).distinct('_id');
  const requestedGender =
    req.query.lookingFor ||
    myPreference?.preferredGender ||
    (mine.gender === 'Male'
      ? 'Female'
      : mine.gender === 'Female'
        ? 'Male'
        : null);
  const query = {
    visibility: 'active',
    lifecycleStatus: 'Active',
    _id: { $nin: [...myBlocked, ...blockedByProfiles, mine._id] },
    ...(requestedGender ? { gender: requestedGender } : {})
  };
  if (req.query.search)
    query.$or = [
      'firstName',
      'lastName',
      'location.city',
      'location.state',
      'education.highestEducation',
      'career.occupation'
    ].map((key) => ({ [key]: escapedRegex(req.query.search) }));
  for (const [param, path] of Object.entries({
    city: 'location.city',
    state: 'location.state',
    education: 'education.highestEducation',
    occupation: 'career.occupation',
    maritalStatus: 'maritalStatus',
    community: 'community.name',
    diet: 'lifestyle.diet'
  }))
    if (req.query[param]) query[path] = escapedRegex(req.query[param]);
  if (req.query.heightMin || req.query.heightMax)
    query.height = {
      ...(req.query.heightMin ? { $gte: Number(req.query.heightMin) } : {}),
      ...(req.query.heightMax ? { $lte: Number(req.query.heightMax) } : {})
    };
  if (req.query.ageMin || req.query.ageMax) {
    const now = new Date();
    query.dateOfBirth = {
      ...(req.query.ageMax
        ? {
            $gte: new Date(
              now.getFullYear() - Number(req.query.ageMax) - 1,
              now.getMonth(),
              now.getDate()
            )
          }
        : {}),
      ...(req.query.ageMin
        ? {
            $lte: new Date(
              now.getFullYear() - Number(req.query.ageMin),
              now.getMonth(),
              now.getDate()
            )
          }
        : {})
    };
  }
  if (req.query.verified === 'true') query['verification.adminVerified'] = true;
  if (req.query.withPhoto === 'true')
    query.profilePhoto = { $exists: true, $nin: ['', null] };
  const page = Math.max(1, Number(req.query.page) || 1),
    limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));
  const [found, total] = await Promise.all([
    MatrimonialProfile.find(query)
      .sort({
        boostedUntil: -1,
        'verification.adminVerified': -1,
        lastActiveAt: -1
      })
      .skip((page - 1) * limit)
      .limit(limit),
    MatrimonialProfile.countDocuments(query)
  ]);
  const shortlisted = await Shortlist.find({ userProfile: mine._id }).distinct(
      'shortlistedProfile'
    ),
    pending = await Interest.find({
      senderProfile: mine._id,
      status: 'Pending'
    }).distinct('receiverProfile');
  const data = await Promise.all(
    found.map(async (profile) => ({
      ...profileCard(
        await serializeProfileForViewer(profile, req.user),
        calculateCompatibility(
          mine,
          myPreference,
          profile,
          await PartnerPreference.findOne({ profileId: profile._id })
        )
      ),
      shortlisted: shortlisted.some((id) => id.equals(profile._id)),
      interestSent: pending.some((id) => id.equals(profile._id))
    }))
  );
  ok(res, {
    profiles: data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findOne({
    profileId: req.params.profileId
  }).populate('userId', 'email phone role');
  if (!profile) throw new ApiError(404, 'Profile not found.');
  const owner = String(profile.userId._id) === String(req.user.id),
    privileged = ['admin', 'moderator', 'super_admin'].includes(req.user.role);
  if (!owner && !privileged && profile.visibility !== 'active')
    throw new ApiError(404, 'Profile not found.');
  const mine = await MatrimonialProfile.findOne({ userId: req.user.id });
  if (mine && !mine._id.equals(profile._id)) {
    const since = new Date(Date.now() - 864e5);
    if (
      !(await ProfileView.exists({
        viewerProfile: mine._id,
        viewedProfile: profile._id,
        viewDate: { $gte: since }
      }))
    )
      await ProfileView.create({
        viewerProfile: mine._id,
        viewedProfile: profile._id
      });
  }
  const serialized = await serializeProfileForViewer(profile, req.user);
  if (!serialized) throw new ApiError(404, 'Profile not found.');
  let compatibility = null;
  if (mine && !mine._id.equals(profile._id))
    compatibility = calculateCompatibility(
      mine,
      await PartnerPreference.findOne({ profileId: mine._id }),
      profile,
      await PartnerPreference.findOne({ profileId: profile._id })
    );
  const contact =
    mine && !mine._id.equals(profile._id)
      ? await ContactRequest.findOne({
          $or: [
            { requesterProfile: mine._id, receiverProfile: profile._id },
            { requesterProfile: profile._id, receiverProfile: mine._id }
          ]
        })
      : null;
  const actionState =
    mine && !mine._id.equals(profile._id)
      ? {
          shortlisted: !!(await Shortlist.exists({
            userProfile: mine._id,
            shortlistedProfile: profile._id
          })),
          interestSent: !!(await Interest.exists({
            senderProfile: mine._id,
            receiverProfile: profile._id,
            status: 'Pending'
          })),
          contactRequest: contact
            ? {
                id: contact._id,
                status: contact.status,
                incoming: contact.receiverProfile.equals(mine._id),
                unlocked: contact.requesterProfile.equals(mine._id)
                  ? !!contact.requesterUnlockedAt
                  : !!contact.receiverUnlockedAt
              }
            : null
        }
      : {};
  ok(res, { profile: serialized, compatibility, actionState });
});
export const getPreferences = asyncHandler(async (req, res) => {
  const profile = await owned(req.user.id, req.query.optional === 'true');
  if (!profile) return ok(res, { preferences: null });
  ok(res, {
    preferences: (await PartnerPreference.findOne({
      profileId: profile._id
    })) || { preferredGender: profile.gender === 'Male' ? 'Female' : 'Male' }
  });
});
export const savePreferences = asyncHandler(async (req, res) => {
  const profile = await owned(req.user.id),
    safe = pick(req.body, [
      'preferredGender',
      'ageMin',
      'ageMax',
      'heightMin',
      'heightMax',
      'maritalStatus',
      'locations',
      'states',
      'countries',
      'educationPreferences',
      'occupationPreferences',
      'incomePreferences',
      'dietPreferences',
      'communityPreferences',
      'marriageTimeline',
      'additionalPreferences'
    ]);
  if (safe.ageMin && safe.ageMax && safe.ageMin > safe.ageMax)
    throw new ApiError(400, 'Minimum age cannot exceed maximum age.');
  if (safe.heightMin && safe.heightMax && safe.heightMin > safe.heightMax)
    throw new ApiError(400, 'Minimum height cannot exceed maximum height.');
  const preferences = await PartnerPreference.findOneAndUpdate(
    { profileId: profile._id },
    { ...safe, profileId: profile._id },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );
  profile.completionPercentage = completion(profile, true);
  await profile.save();
  ok(res, { preferences }, 'Preferences saved.');
});
export const updatePrivacy = asyncHandler(async (req, res) => {
  const profile = await owned(req.user.id);
  profile.privacy = {
    ...profile.privacy?.toObject?.(),
    ...pick(req.body, [
      'photoVisibility',
      'contactVisibility',
      'incomeVisibility',
      'familyVisibility',
      'fullNameVisibility'
    ])
  };
  await profile.save();
  ok(res, { privacy: profile.privacy }, 'Privacy updated.');
});
export const setPause = asyncHandler(async (req, res) => {
  const profile = await owned(req.user.id);
  if (req.body.paused) {
    if (profile.visibility !== 'active')
      throw new ApiError(400, 'Only an active profile can be paused.');
    profile.visibility = 'paused';
    profile.lifecycleStatus = 'Paused';
  } else {
    if (profile.visibility !== 'paused')
      throw new ApiError(400, 'Profile is not paused.');
    profile.visibility = 'active';
    profile.lifecycleStatus = 'Active';
  }
  await profile.save();
  ok(
    res,
    { visibility: profile.visibility },
    req.body.paused ? 'Profile paused.' : 'Profile resumed.'
  );
});
export const savePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose an image to upload.');
  const profile = await owned(req.user.id),
    previous = profile.profilePhotoPublicId || profile.profilePhoto,
    asset = await mediaService.fromUpload(req.file);
  profile.profilePhoto = asset.url;
  profile.profilePhotoPublicId = asset.publicId;
  profile.completionPercentage = completion(
    profile,
    !!(await PartnerPreference.exists({ profileId: profile._id }))
  );
  await profile.save();
  if (previous && previous !== asset.url) await mediaService.delete(previous);
  ok(
    res,
    { path: profile.profilePhoto, profilePhoto: profile.profilePhoto },
    'Photo uploaded.',
    201
  );
});
export const addGalleryPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose an image to upload.');
  const profile = await owned(req.user.id),
    settings = await getSystemSettings();
  if ((profile.galleryAssets?.length || 0) >= settings.maxPhotos)
    throw new ApiError(
      409,
      `Your gallery is limited to ${settings.maxPhotos} photos.`
    );
  const asset = await mediaService.fromUpload(req.file);
  profile.galleryAssets.push(asset);
  await profile.save();
  ok(
    res,
    { gallery: profile.galleryAssets, maxPhotos: settings.maxPhotos },
    'Gallery photo uploaded.',
    201
  );
});
export const removeGalleryPhoto = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.assetId))
    throw new ApiError(400, 'Invalid gallery asset.');
  const profile = await owned(req.user.id),
    asset = profile.galleryAssets.id(req.params.assetId);
  if (!asset) throw new ApiError(404, 'Gallery photo not found.');
  const reference = asset.publicId || asset.url;
  asset.deleteOne();
  await profile.save();
  await mediaService.delete(reference);
  ok(res, { gallery: profile.galleryAssets }, 'Gallery photo removed.');
});
export const getBlocks = asyncHandler(async (req, res) =>
  ok(res, {
    blocks: await Block.find({ user: req.user.id }).populate(
      'blockedProfile',
      'profileId firstName lastName profilePhoto location'
    )
  })
);
export const removeBlock = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.profileId))
    throw new ApiError(400, 'Invalid profile ID.');
  await Block.deleteOne({
    user: req.user.id,
    blockedProfile: req.params.profileId
  });
  ok(res, {}, 'Profile unblocked.');
});
