import mongoose from 'mongoose';

import MatrimonialProfile from '../models/MatrimonialProfile.js';
import PartnerPreference from '../models/PartnerPreference.js';

import {
  Block
} from '../models/Platform.js';

import {
  Interest,
  Shortlist
} from '../models/Interaction.js';

import {
  ContactRequest,
  ProfileView
} from '../models/Business.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

import {
  completion,
  calculateCompatibility,
  profileCard
} from '../utils/profile.js';

import {
  serializeProfileForViewer
} from '../services/profilePrivacy.js';

import {
  mediaService
} from '../services/mediaService.js';

import {
  getSystemSettings
} from '../services/systemService.js';

const owned =
  async (
    user,
    optional = false
  ) => {
    const profile =
      await MatrimonialProfile.findOne({
        userId:
          user
      }).populate(
        'userId',
        'email phone role'
      );

    if (
      !profile &&
      optional
    ) {
      return null;
    }

    if (!profile) {
      throw new ApiError(
        404,
        'Create your profile first.'
      );
    }

    return profile;
  };

const pick =
  (
    source,
    keys
  ) =>
    Object.fromEntries(
      keys
        .filter(
          (key) =>
            source?.[key] !==
            undefined
        )
        .map(
          (key) => [
            key,
            source[key]
          ]
        )
    );

const emptyToUndefined =
  (value) => {
    if (
      typeof value ===
        'string' &&
      value.trim() ===
        ''
    ) {
      return undefined;
    }

    return value;
  };

const normalizeBoolean =
  (value) => {
    if (
      value === true ||
      value === false
    ) {
      return value;
    }

    if (
      value === 'true'
    ) {
      return true;
    }

    if (
      value === 'false'
    ) {
      return false;
    }

    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      return undefined;
    }

    return value;
  };

const cleanObject =
  (object) =>
    Object.fromEntries(
      Object.entries(
        object || {}
      )
        .map(
          ([
            key,
            value
          ]) => [
            key,
            emptyToUndefined(
              value
            )
          ]
        )
        .filter(
          ([
            ,
            value
          ]) =>
            value !==
            undefined
        )
    );

const objectValue =
  (value) => {
    if (!value) {
      return {};
    }

    if (
      typeof value.toObject ===
        'function'
    ) {
      return value.toObject();
    }

    if (
      typeof value ===
        'object' &&
      !Array.isArray(
        value
      )
    ) {
      return {
        ...value
      };
    }

    return {};
  };

const deepMerge =
  (
    existing,
    incoming
  ) => {
    const base =
      objectValue(
        existing
      );

    const source =
      objectValue(
        incoming
      );

    const result = {
      ...base
    };

    for (
      const [
        key,
        value
      ]
      of Object.entries(
        source
      )
    ) {
      if (
        value ===
        undefined
      ) {
        continue;
      }

      if (
        value &&
        typeof value ===
          'object' &&
        !Array.isArray(
          value
        ) &&
        !(
          value instanceof
          Date
        )
      ) {
        result[key] =
          deepMerge(
            base[key],
            value
          );

        continue;
      }

      result[key] =
        value;
    }

    return result;
  };

const setNestedIfPresent =
  (
    safe,
    body,
    key,
    fields
  ) => {
    if (
      !body?.[key] ||
      typeof body[key] !==
        'object' ||
      Array.isArray(
        body[key]
      )
    ) {
      return;
    }

    const nested =
      cleanObject(
        pick(
          body[key],
          fields
        )
      );

    if (
      Object.keys(
        nested
      ).length
    ) {
      safe[key] =
        nested;
    }
  };

const mosalPayload =
  (source) => {
    if (
      !source ||
      typeof source !==
        'object' ||
      Array.isArray(
        source
      )
    ) {
      return undefined;
    }

    const value =
      cleanObject(
        pick(
          source,
          [
            'mamaName',
            'grandmotherName',
            'familySurname',
            'clanSurname',
            'nativeVillage',
            'taluka',
            'district',
            'state',
            'notes'
          ]
        )
      );

    return Object.keys(
      value
    ).length
      ? value
      : undefined;
  };

const profilePayload =
  (body) => {
    const safe =
      cleanObject(
        pick(
          body,
          [
            'profileFor',
            'firstName',
            'middleName',
            'lastName',
            'gender',
            'dateOfBirth',
            'height',
            'bloodGroup',
            'complexion',
            'maritalStatus',
            'marriageTimeline',
            'aboutMe',
            'visibility'
          ]
        )
      );

    setNestedIfPresent(
      safe,
      body,
      'birthDetails',
      [
        'timeOfBirth',
        'city',
        'district',
        'state',
        'country'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'location',
      [
        'city',
        'taluka',
        'district',
        'state',
        'country',
        'nativePlace',
        'nativeTaluka',
        'nativeDistrict',
        'nativeState'
      ]
    );

    /*
     * subCommunity intentionally excluded.
     * Old DB data stays untouched, but new
     * writes cannot re-introduce it.
     */
    setNestedIfPresent(
      safe,
      body,
      'community',
      [
        'religion',
        'caste',
        'name',
        'clan',
        'gotra',
        'vansh',
        'kulaDevi',
        'ishtaDevta',
        'familyOrigin'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'education',
      [
        'highestEducation',
        'degree',
        'specialization',
        'college',
        'university',
        'educationDetails'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'career',
      [
        'occupationType',
        'occupation',
        'designation',
        'companyName',
        'businessName',
        'annualIncome',
        'incomeVisibility'
      ]
    );

    if (
      body?.career
        ?.workLocation &&
      typeof body.career
        .workLocation ===
        'object'
    ) {
      safe.career = {
        ...(safe.career ||
          {}),

        workLocation:
          cleanObject(
            pick(
              body.career
                .workLocation,
              [
                'city',
                'state',
                'country'
              ]
            )
          )
      };
    }

    setNestedIfPresent(
      safe,
      body,
      'lifestyle',
      [
        'diet',
        'smoking',
        'drinking',
        'interests'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'family',
      [
        'fatherName',
        'fatherOccupation',
        'motherName',
        'motherOccupation',
        'siblings',
        'siblingDetails',
        'familyType',
        'familyValues',
        'familyLocation',
        'familyDescription'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'privacy',
      [
        'photoVisibility',
        'contactVisibility',
        'incomeVisibility',
        'familyVisibility',
        'fullNameVisibility',
        'familyOverviewVisibility',
        'maternalFamilyVisibility',
        'siblingDetailsVisibility',
        'assetVisibility',
        'astrologyVisibility',
        'contactAddressVisibility'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'maritalHistory',
      [
        'status',
        'isRemarriage',
        'previousMarriageEndedAt',
        'divorceFinalized',
        'childrenFromPreviousMarriage',
        'childrenCount',
        'childrenLivingWith',
        'notes'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'paternalFamily',
      [
        'ancestralVillage',
        'nativePlace',
        'taluka',
        'district',
        'state',
        'familySurname',
        'clan',
        'gotra',
        'notes'
      ]
    );

    /*
     * Important:
     * notes is deliberately excluded here.
     *
     * Existing legacy notes survive because
     * nested profile updates are deep-merged.
     *
     * New clients must write maternalGotra.
     */
    setNestedIfPresent(
      safe,
      body,
      'maternalFamily',
      [
        'maternalGrandfatherName',
        'maternalFamilySurname',
        'maternalNativePlace',
        'maternalVillage',
        'maternalTaluka',
        'maternalDistrict',
        'maternalState',
        'maternalClan',
        'maternalGotra'
      ]
    );

    if (
      body?.maternalLineage &&
      typeof body
        .maternalLineage ===
        'object' &&
      !Array.isArray(
        body.maternalLineage
      )
    ) {
      const selfMosal =
        mosalPayload(
          body
            .maternalLineage
            .selfMosal
        );

      const fathersMosal =
        mosalPayload(
          body
            .maternalLineage
            .fathersMosal
        );

      const mothersMosal =
        mosalPayload(
          body
            .maternalLineage
            .mothersMosal
        );

      const lineage = {
        ...(selfMosal
          ? {
              selfMosal
            }
          : {}),

        ...(fathersMosal
          ? {
              fathersMosal
            }
          : {}),

        ...(mothersMosal
          ? {
              mothersMosal
            }
          : {})
      };

      if (
        Object.keys(
          lineage
        ).length
      ) {
        safe.maternalLineage =
          lineage;
      }
    }

    setNestedIfPresent(
      safe,
      body,
      'astrology',
      [
        'rashi',
        'nakshatra',
        'manglik'
      ]
    );

    setNestedIfPresent(
      safe,
      body,
      'contactDetails',
      [
        'guardianName',
        'guardianRelation',
        'guardianPhone',
        'selfPhone',
        'email'
      ]
    );

    if (
      body?.contactDetails
        ?.currentAddress &&
      typeof body
        .contactDetails
        .currentAddress ===
        'object'
    ) {
      safe.contactDetails = {
        ...(safe.contactDetails ||
          {}),

        currentAddress:
          cleanObject(
            pick(
              body
                .contactDetails
                .currentAddress,
              [
                'addressLine1',
                'addressLine2',
                'city',
                'taluka',
                'district',
                'state',
                'pincode',
                'country'
              ]
            )
          )
      };
    }

    setNestedIfPresent(
  safe,
  body,
  'familyAssets',
  [
    'agricultureLand',
    'residentialProperties',
    'otherProperties',
    'businessAssets',
    'assetSummary',

    /*
     * Legacy support.
     */
    'propertySummary',
    'primaryResidenceType',
    'businessAssetsSummary'
  ]
);

    setNestedIfPresent(
      safe,
      body,
      'biodataPrivacy',
      [
        'includeSensitiveFamilyDetailsInBiodata',
        'includeContactDetailsInBiodata',
        'includeAstrologyInBiodata',
        'includeAssetsInBiodata'
      ]
    );

    if (
      safe.maritalHistory
    ) {
      safe.maritalHistory
        .isRemarriage =
        normalizeBoolean(
          safe.maritalHistory
            .isRemarriage
        );

      safe.maritalHistory
        .divorceFinalized =
        normalizeBoolean(
          safe.maritalHistory
            .divorceFinalized
        );

      safe.maritalHistory
        .childrenFromPreviousMarriage =
        normalizeBoolean(
          safe.maritalHistory
            .childrenFromPreviousMarriage
        );

      safe.maritalHistory =
        cleanObject(
          safe.maritalHistory
        );
    }

    if (
      safe.familyAssets
        ?.agricultureLand
    ) {
      safe.familyAssets
        .agricultureLand = {
        ...safe.familyAssets
          .agricultureLand,

        hasLand:
          normalizeBoolean(
            safe.familyAssets
              .agricultureLand
              .hasLand
          )
      };

      safe.familyAssets
        .agricultureLand =
        cleanObject(
          safe.familyAssets
            .agricultureLand
        );
    }

    if (
      safe.biodataPrivacy
    ) {
      for (
        const key
        of [
          'includeSensitiveFamilyDetailsInBiodata',
          'includeContactDetailsInBiodata',
          'includeAstrologyInBiodata',
          'includeAssetsInBiodata'
        ]
      ) {
        if (
          safe
            .biodataPrivacy[
            key
          ] !==
          undefined
        ) {
          safe
            .biodataPrivacy[
            key
          ] =
            normalizeBoolean(
              safe
                .biodataPrivacy[
                key
              ]
            );
        }
      }

      safe.biodataPrivacy =
        cleanObject(
          safe.biodataPrivacy
        );
    }

    if (
      safe.visibility &&
      ![
        'draft',
        'pending_review',
        'paused'
      ].includes(
        safe.visibility
      )
    ) {
      delete safe.visibility;
    }

    return safe;
  };

const nestedProfileSections = [
  'birthDetails',
  'location',
  'community',
  'education',
  'career',
  'lifestyle',
  'family',
  'privacy',
  'maritalHistory',
  'paternalFamily',
  'maternalFamily',
  'maternalLineage',
  'astrology',
  'contactDetails',
  'familyAssets',
  'biodataPrivacy'
];

const mergeProfileData =
  (
    profile,
    incoming
  ) => {
    const topLevel = {
      ...incoming
    };

    for (
      const key
      of nestedProfileSections
    ) {
      delete topLevel[
        key
      ];
    }

    Object.assign(
      profile,
      topLevel
    );

    for (
      const key
      of nestedProfileSections
    ) {
      if (
        incoming[key] ===
        undefined
      ) {
        continue;
      }

      profile[key] =
        deepMerge(
          profile[key],
          incoming[key]
        );
    }
  };

const escapedRegex =
  (value) =>
    new RegExp(
      String(
        value
      ).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      ),
      'i'
    );

export const upsert =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const safe =
        profilePayload(
          req.body
        );

      if (
        safe.dateOfBirth
      ) {
        const dob =
          new Date(
            safe.dateOfBirth
          );

        const age =
          (
            Date.now() -
            dob.getTime()
          ) /
          (
            365.25 *
            864e5
          );

        if (
          !Number.isFinite(
            age
          ) ||
          age < 18 ||
          age > 80
        ) {
          throw new ApiError(
            400,
            'Date of birth must represent an age between 18 and 80.'
          );
        }
      }

      let profile =
        await MatrimonialProfile.findOne({
          userId:
            req.user.id
        });

      if (profile) {
        mergeProfileData(
          profile,
          safe
        );
      } else {
        profile =
          new MatrimonialProfile({
            ...safe,

            userId:
              req.user.id
          });
      }

      if (
        profile.visibility ===
          'pending_review' &&
        (
          !profile.firstName ||
          !profile.profileFor
        )
      ) {
        throw new ApiError(
          400,
          'Profile name and profile owner are required before review.'
        );
      }

      await profile.save();

      const preference =
        await PartnerPreference.findOne({
          profileId:
            profile.id
        });

      profile.completionPercentage =
        completion(
          profile,
          !!preference
        );

      profile.lastActiveAt =
        new Date();

      await profile.save();

      ok(
        res,
        {
          profile:
            await serializeProfileForViewer(
              await profile.populate(
                'userId',
                'email phone role'
              ),
              req.user
            )
        },

        'Profile saved.',
        201
      );
    }
  );

export const mine =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await owned(
          req.user.id,
          req.query.optional ===
            'true'
        );

      ok(
        res,
        {
          profile:
            profile
              ? await serializeProfileForViewer(
                  profile,
                  req.user
                )
              : null
        }
      );
    }
  );

export const discover =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const mine =
        await MatrimonialProfile.findOne({
          userId:
            req.user.id
        });

      if (
        !mine
      ) {
        throw new ApiError(
          404,
          'Create your profile first.'
        );
      }

      const myPreference =
        await PartnerPreference.findOne({
          profileId:
            mine._id
        });

      const [
        myBlocked,
        blockedByUsers
      ] =
        await Promise.all([
          Block.find({
            user:
              req.user.id
          }).distinct(
            'blockedProfile'
          ),

          Block.find({
            blockedProfile:
              mine._id
          }).distinct(
            'user'
          )
        ]);

      const blockedByProfiles =
        blockedByUsers.length
          ? await MatrimonialProfile.find({
              userId: {
                $in:
                  blockedByUsers
              }
            }).distinct(
              '_id'
            )
          : [];

      const requestedGender =
        req.query
          .lookingFor ||
        myPreference
          ?.preferredGender ||
        (
          mine.gender ===
          'Male'
            ? 'Female'
            : mine.gender ===
                'Female'
              ? 'Male'
              : null
        );

      const query = {
        visibility:
          'active',

        lifecycleStatus:
          'Active',

        _id: {
          $nin: [
            mine._id,
            ...myBlocked,
            ...blockedByProfiles
          ]
        },

        ...(requestedGender
          ? {
              gender:
                requestedGender
            }
          : {})
      };

      /*
       * Discovery intentionally uses public/native
       * matrimonial profile context.
       *
       * Exact current residential address is private
       * and is never searchable here.
       */
      if (
        req.query.search
      ) {
        query.$or = [
          'firstName',
          'middleName',
          'lastName',
          'location.nativePlace',
          'location.nativeDistrict',
          'location.nativeState',
          'community.clan',
          'community.gotra',
          'community.vansh',
          'education.highestEducation',
          'education.degree',
          'career.occupation',
          'career.designation'
        ].map(
          (
            key
          ) => ({
            [key]:
              escapedRegex(
                req.query.search
              )
          })
        );
      }

      const textFilters = {
        district:
          'location.nativeDistrict',

        state:
          'location.nativeState',

        education:
          'education.highestEducation',

        occupation:
          'career.occupation',

        maritalStatus:
          'maritalStatus',

        clan:
          'community.clan',

        gotra:
          'community.gotra',

        vansh:
          'community.vansh',

        diet:
          'lifestyle.diet'
      };

      for (
        const [
          param,
          fieldPath
        ] of Object.entries(
          textFilters
        )
      ) {
        if (
          req.query[
            param
          ]
        ) {
          query[fieldPath] =
            escapedRegex(
              req.query[
                param
              ]
            );
        }
      }

      const heightMin =
        Number(
          req.query
            .heightMin
        );

      const heightMax =
        Number(
          req.query
            .heightMax
        );

      if (
        Number.isFinite(
          heightMin
        ) ||
        Number.isFinite(
          heightMax
        )
      ) {
        query.height = {
          ...(Number.isFinite(
            heightMin
          )
            ? {
                $gte:
                  heightMin
              }
            : {}),

          ...(Number.isFinite(
            heightMax
          )
            ? {
                $lte:
                  heightMax
              }
            : {})
        };
      }

      const ageMin =
        Number(
          req.query
            .ageMin
        );

      const ageMax =
        Number(
          req.query
            .ageMax
        );

      if (
        Number.isFinite(
          ageMin
        ) ||
        Number.isFinite(
          ageMax
        )
      ) {
        const now =
          new Date();

        const dateOfBirth = {};

        /*
         * Age >= minimum age:
         * DOB must be on or before today minus ageMin.
         */
        if (
          Number.isFinite(
            ageMin
          )
        ) {
          const youngest =
            new Date(
              now
            );

          youngest.setFullYear(
            now.getFullYear() -
              ageMin
          );

          dateOfBirth.$lte =
            youngest;
        }

        /*
         * Age <= maximum age:
         * DOB must be after the day representing
         * maximumAge + 1 years ago.
         */
        if (
          Number.isFinite(
            ageMax
          )
        ) {
          const oldest =
            new Date(
              now
            );

          oldest.setFullYear(
            now.getFullYear() -
              ageMax -
              1
          );

          oldest.setDate(
            oldest.getDate() +
              1
          );

          dateOfBirth.$gte =
            oldest;
        }

        query.dateOfBirth =
          dateOfBirth;
      }

      if (
        req.query.verified ===
        'true'
      ) {
        query[
          'verification.adminVerified'
        ] =
          true;
      }

      if (
        req.query.withPhoto ===
        'true'
      ) {
        query.profilePhoto = {
          $exists:
            true,

          $nin: [
            '',
            null
          ]
        };
      }

      const page =
        Math.max(
          1,
          Number(
            req.query.page
          ) ||
            1
        );

      const limit =
        Math.min(
          30,
          Math.max(
            1,
            Number(
              req.query.limit
            ) ||
              12
          )
        );

      const [
        found,
        total
      ] =
        await Promise.all([
          MatrimonialProfile.find(
            query
          )
            .sort({
              boostedUntil:
                -1,

              'verification.adminVerified':
                -1,

              lastActiveAt:
                -1,

              updatedAt:
                -1
            })
            .skip(
              (
                page -
                1
              ) *
                limit
            )
            .limit(
              limit
            ),

          MatrimonialProfile.countDocuments(
            query
          )
        ]);

      const foundIds =
        found.map(
          (
            profile
          ) =>
            profile._id
        );

      const [
        shortlisted,
        interests
      ] =
        foundIds.length
          ? await Promise.all([
              Shortlist.find({
                userProfile:
                  mine._id,

                shortlistedProfile: {
                  $in:
                    foundIds
                }
              }).select(
                'shortlistedProfile'
              ),

              Interest.find({
                senderProfile:
                  mine._id,

                receiverProfile: {
                  $in:
                    foundIds
                },

                status: {
                  $in: [
                    'Pending',
                    'Accepted'
                  ]
                }
              }).select(
                'receiverProfile status'
              )
            ])
          : [
              [],
              []
            ];

      const shortlistSet =
        new Set(
          shortlisted.map(
            (
              item
            ) =>
              String(
                item.shortlistedProfile
              )
          )
        );

      const interestMap =
        new Map(
          interests.map(
            (
              item
            ) => [
              String(
                item.receiverProfile
              ),

              item.status
            ]
          )
        );

      /*
       * Discover intentionally does not calculate or
       * rank by compatibility yet.
       *
       * That logic belongs to the dedicated matching /
       * recommendation engine so discovery does not
       * expose a misleading temporary score.
       */
      const profiles =
        (
          await Promise.all(
            found.map(
              async (
                profile
              ) => {
                const serialized =
                  await serializeProfileForViewer(
                    profile,
                    req.user
                  );

                if (
                  !serialized
                ) {
                  return null;
                }

                const id =
                  String(
                    profile._id
                  );

                return {
                  ...profileCard(
                    serialized
                  ),

                  shortlisted:
                    shortlistSet.has(
                      id
                    ),

                  interestSent:
                    interestMap.has(
                      id
                    ),

                  interestStatus:
                    interestMap.get(
                      id
                    ) ||
                    null
                };
              }
            )
          )
        ).filter(
          Boolean
        );

      ok(
        res,
        {
          profiles,

          pagination: {
            page,

            limit,

            total,

            totalPages:
              Math.ceil(
                total /
                  limit
              )
          }
        }
      );
    }
  );
export const getOne =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await MatrimonialProfile.findOne({
          profileId:
            req.params
              .profileId
        }).populate(
          'userId',
          'email phone role'
        );

      if (!profile) {
        throw new ApiError(
          404,
          'Profile not found.'
        );
      }

      const owner =
        String(
          profile.userId?._id ||
            profile.userId
        ) ===
        String(
          req.user.id
        );

      const privileged =
        [
          'admin',
          'moderator',
          'super_admin'
        ].includes(
          req.user.role
        );

      if (
        !owner &&
        !privileged &&
        profile.visibility !==
          'active'
      ) {
        throw new ApiError(
          404,
          'Profile not found.'
        );
      }

      const mine =
        await MatrimonialProfile.findOne({
          userId:
            req.user.id
        });

      if (
        mine &&
        !mine._id.equals(
          profile._id
        )
      ) {
        const since =
          new Date(
            Date.now() -
              864e5
          );

        const viewed =
          await ProfileView.exists({
            viewerProfile:
              mine._id,

            viewedProfile:
              profile._id,

            viewDate: {
              $gte:
                since
            }
          });

        if (!viewed) {
          await ProfileView.create({
            viewerProfile:
              mine._id,

            viewedProfile:
              profile._id
          });
        }
      }

      const serialized =
        await serializeProfileForViewer(
          profile,
          req.user
        );

      if (
        !serialized
      ) {
        throw new ApiError(
          404,
          'Profile not found.'
        );
      }

      let compatibility =
        null;

      if (
        mine &&
        !mine._id.equals(
          profile._id
        )
      ) {
        compatibility =
          calculateCompatibility(
            mine,

            await PartnerPreference.findOne({
              profileId:
                mine._id
            }),

            profile,

            await PartnerPreference.findOne({
              profileId:
                profile._id
            })
          );
      }

      const contact =
        mine &&
        !mine._id.equals(
          profile._id
        )
          ? await ContactRequest.findOne({
              $or: [
                {
                  requesterProfile:
                    mine._id,

                  receiverProfile:
                    profile._id
                },

                {
                  requesterProfile:
                    profile._id,

                  receiverProfile:
                    mine._id
                }
              ]
            })
          : null;

      const actionState =
        mine &&
        !mine._id.equals(
          profile._id
        )
          ? {
              shortlisted:
                !!(
                  await Shortlist.exists({
                    userProfile:
                      mine._id,

                    shortlistedProfile:
                      profile._id
                  })
                ),

              interestSent:
                !!(
                  await Interest.exists({
                    senderProfile:
                      mine._id,

                    receiverProfile:
                      profile._id,

                    status:
                      'Pending'
                  })
                ),

              contactRequest:
                contact
                  ? {
                      id:
                        contact._id,

                      status:
                        contact.status,

                      incoming:
                        contact
                          .receiverProfile
                          .equals(
                            mine._id
                          ),

                      unlocked:
                        contact
                          .requesterProfile
                          .equals(
                            mine._id
                          )
                          ? !!contact
                              .requesterUnlockedAt
                          : !!contact
                              .receiverUnlockedAt
                    }
                  : null
            }
          : {};

      ok(
        res,
        {
          profile:
            serialized,

          compatibility,

          actionState
        }
      );
    }
  );

export const getPreferences =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await owned(
          req.user.id,
          req.query.optional ===
            'true'
        );

      if (!profile) {
        return ok(
          res,
          {
            preferences:
              null
          }
        );
      }

      ok(
        res,
        {
          preferences:
            (
              await PartnerPreference.findOne({
                profileId:
                  profile._id
              })
            ) || {
              preferredGender:
                profile.gender ===
                  'Male'
                  ? 'Female'
                  : 'Male'
            }
        }
      );
    }
  );

export const savePreferences =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await owned(
          req.user.id
        );

      const safe =
        pick(
          req.body,
          [
            'preferredGender',
            'ageMin',
            'ageMax',
            'heightMin',
            'heightMax',
            'maritalStatus',
            'acceptedMaritalStatuses',
            'willingForRemarriage',
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
          ]
        );

      if (
        safe.ageMin &&
        safe.ageMax &&
        safe.ageMin >
          safe.ageMax
      ) {
        throw new ApiError(
          400,
          'Minimum age cannot exceed maximum age.'
        );
      }

      if (
        safe.heightMin &&
        safe.heightMax &&
        safe.heightMin >
          safe.heightMax
      ) {
        throw new ApiError(
          400,
          'Minimum height cannot exceed maximum height.'
        );
      }

      /*
       * Always persist Preferred States as an
       * array. This also safely handles any
       * older client that sends CSV text.
       */
      if (
        safe.states !==
        undefined
      ) {
        safe.states =
          Array.isArray(
            safe.states
          )
            ? safe.states
                .map(
                  (state) =>
                    typeof state ===
                      'string'
                      ? state.trim()
                      : state
                )
                .filter(
                  Boolean
                )
            : typeof safe.states ===
                'string'
              ? safe.states
                  .split(',')
                  .map(
                    (state) =>
                      state.trim()
                  )
                  .filter(
                    Boolean
                  )
              : [];
      }

      const preferences =
        await PartnerPreference.findOneAndUpdate(
          {
            profileId:
              profile._id
          },

          {
            ...safe,

            profileId:
              profile._id
          },

          {
            upsert:
              true,

            returnDocument:
              'after',

            runValidators:
              true
          }
        );

      profile.completionPercentage =
        completion(
          profile,
          true
        );

      await profile.save();

      ok(
        res,
        {
          preferences
        },

        'Preferences saved.'
      );
    }
  );

export const updatePrivacy =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await owned(
          req.user.id
        );

      profile.privacy = {
        ...profile.privacy
          ?.toObject?.(),

        ...pick(
          req.body,
          [
            'photoVisibility',
            'contactVisibility',
            'incomeVisibility',
            'familyVisibility',
            'fullNameVisibility',
            'familyOverviewVisibility',
            'maternalFamilyVisibility',
            'siblingDetailsVisibility',
            'assetVisibility',
            'astrologyVisibility',
            'contactAddressVisibility'
          ]
        )
      };

      await profile.save();

      ok(
        res,
        {
          privacy:
            profile.privacy
        },

        'Privacy updated.'
      );
    }
  );

export const setPause =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await owned(
          req.user.id
        );

      if (
        req.body.paused
      ) {
        if (
          profile.visibility !==
          'active'
        ) {
          throw new ApiError(
            400,
            'Only an active profile can be paused.'
          );
        }

        profile.visibility =
          'paused';

        profile.lifecycleStatus =
          'Paused';
      } else {
        if (
          profile.visibility !==
          'paused'
        ) {
          throw new ApiError(
            400,
            'Profile is not paused.'
          );
        }

        profile.visibility =
          'active';

        profile.lifecycleStatus =
          'Active';
      }

      await profile.save();

      ok(
        res,
        {
          visibility:
            profile.visibility
        },

        req.body.paused
          ? 'Profile paused.'
          : 'Profile resumed.'
      );
    }
  );

export const savePhoto =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (!req.file) {
        throw new ApiError(
          400,
          'Choose an image to upload.'
        );
      }

      const profile =
        await owned(
          req.user.id
        );

      const previous = {
        publicId:
          profile
            .profilePhotoPublicId,

        url:
          profile
            .profilePhoto
      };

      const asset =
        await mediaService.fromUpload(
          req.file
        );

      try {
        profile.profilePhoto =
          asset.url;

        profile.profilePhotoPublicId =
          asset.publicId;

        profile.completionPercentage =
          completion(
            profile,
            !!(
              await PartnerPreference.exists({
                profileId:
                  profile._id
              })
            )
          );

        await profile.save();
      } catch (
        error
      ) {
        await mediaService
          .delete({
            publicId:
              asset.publicId,

            url:
              asset.url
          })
          .catch(
            () => {}
          );

        throw error;
      }

      if (
        previous.publicId ||
        previous.url
      ) {
        await mediaService
          .delete({
            publicId:
              previous.publicId,

            url:
              previous.url
          })
          .catch(
            (error) =>
              console.error(
                'Previous profile photo cleanup failed:',
                error.message
              )
          );
      }

      const temporaryUrl =
        mediaService.accessUrl({
          publicId:
            asset.publicId,

          url:
            asset.url
        });

      ok(
        res,
        {
          path:
            temporaryUrl,

          profilePhoto:
            temporaryUrl
        },

        'Photo uploaded.',
        201
      );
    }
  );

export const addGalleryPhoto =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (!req.file) {
        throw new ApiError(
          400,
          'Choose an image to upload.'
        );
      }

      const profile =
        await owned(
          req.user.id
        );

      const settings =
        await getSystemSettings();

      if (
        (
          profile.galleryAssets
            ?.length ||
          0
        ) >=
        settings.maxPhotos
      ) {
        throw new ApiError(
          409,
          `Your gallery is limited to ${settings.maxPhotos} photos.`
        );
      }

      const asset =
        await mediaService.fromUpload(
          req.file
        );

      try {
        profile.galleryAssets.push({
          url:
            asset.url,

          publicId:
            asset.publicId
        });

        await profile.save();
      } catch (
        error
      ) {
        await mediaService
          .delete({
            publicId:
              asset.publicId,

            url:
              asset.url
          })
          .catch(
            () => {}
          );

        throw error;
      }

      const gallery =
        profile.galleryAssets.map(
          (galleryAsset) => ({
            _id:
              galleryAsset._id,

            url:
              mediaService.accessUrl({
                publicId:
                  galleryAsset
                    .publicId,

                url:
                  galleryAsset.url
              })
          })
        );

      ok(
        res,
        {
          gallery,

          maxPhotos:
            settings.maxPhotos
        },

        'Gallery photo uploaded.',
        201
      );
    }
  );

export const removeGalleryPhoto =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (
        !mongoose.isValidObjectId(
          req.params.assetId
        )
      ) {
        throw new ApiError(
          400,
          'Invalid gallery asset.'
        );
      }

      const profile =
        await owned(
          req.user.id
        );

      const asset =
        profile.galleryAssets.id(
          req.params.assetId
        );

      if (!asset) {
        throw new ApiError(
          404,
          'Gallery photo not found.'
        );
      }

      const reference = {
        publicId:
          asset.publicId,

        url:
          asset.url
      };

      asset.deleteOne();

      await profile.save();

      await mediaService.delete(
        reference
      );

      const gallery =
        profile.galleryAssets.map(
          (galleryAsset) => ({
            _id:
              galleryAsset._id,

            url:
              mediaService.accessUrl({
                publicId:
                  galleryAsset
                    .publicId,

                url:
                  galleryAsset.url
              })
          })
        );

      ok(
        res,
        {
          gallery
        },

        'Gallery photo removed.'
      );
    }
  );

export const getBlocks =
  asyncHandler(
    async (
      req,
      res
    ) =>
      ok(
        res,
        {
          blocks:
            await Block.find({
              user:
                req.user.id
            }).populate(
              'blockedProfile',
              'profileId firstName lastName profilePhoto location'
            )
        }
      )
  );

export const removeBlock =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (
        !mongoose.isValidObjectId(
          req.params.profileId
        )
      ) {
        throw new ApiError(
          400,
          'Invalid profile ID.'
        );
      }

      await Block.deleteOne({
        user:
          req.user.id,

        blockedProfile:
          req.params.profileId
      });

      ok(
        res,
        {},
        'Profile unblocked.'
      );
    }
  );