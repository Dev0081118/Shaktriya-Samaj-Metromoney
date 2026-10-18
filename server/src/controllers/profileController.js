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
  isSameSurname,
  sameSurnameMongoExclusion
} from '../utils/communityRules.js';

import {
  serializeProfileForViewer
} from '../services/profilePrivacy.js';

import {
  mediaService
} from '../services/mediaService.js';

import {
  getSystemSettings
} from '../services/systemService.js';

import {
  clearExpiredProfileBoosts,
  isProfileBoostActive
} from '../services/boostExposureService.js';

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
          (
            key
          ) =>
            source?.[
              key
            ] !==
            undefined
        )
        .map(
          (
            key
          ) => [
            key,
            source[
              key
            ]
          ]
        )
    );

const emptyToUndefined =
  (
    value
  ) => {
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
  (
    value
  ) => {
    if (
      value ===
        true ||
      value ===
        false
    ) {
      return value;
    }

    if (
      value ===
      'true'
    ) {
      return true;
    }

    if (
      value ===
      'false'
    ) {
      return false;
    }

    if (
      value ===
        '' ||
      value ===
        null ||
      value ===
        undefined
    ) {
      return undefined;
    }

    return value;
  };

const optionalNumber =
  (
    value
  ) => {
    if (
      value ===
        '' ||
      value ===
        null ||
      value ===
        undefined
    ) {
      return undefined;
    }

    const parsed =
      Number(
        value
      );

    return Number.isFinite(
      parsed
    )
      ? parsed
      : undefined;
  };

const normalizeStringArray =
  (
    value
  ) => {
    const values =
      Array.isArray(
        value
      )
        ? value
        : typeof value ===
            'string'
          ? value.split(
              ','
            )
          : [];

    return [
      ...new Set(
        values
          .map(
            (
              item
            ) =>
              String(
                item
              ).trim()
          )
          .filter(
            Boolean
          )
      )
    ];
  };

const cleanObject =
  (
    object
  ) =>
    Object.fromEntries(
      Object.entries(
        object ||
          {}
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
  (
    value
  ) => {
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
      ] of Object.entries(
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
        result[
          key
        ] =
          deepMerge(
            base[
              key
            ],
            value
          );

        continue;
      }

      result[
        key
      ] =
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
      !body?.[
        key
      ] ||
      typeof body[
        key
      ] !==
        'object' ||
      Array.isArray(
        body[
          key
        ]
      )
    ) {
      return;
    }

    const nested =
      cleanObject(
        pick(
          body[
            key
          ],
          fields
        )
      );

    if (
      Object.keys(
        nested
      ).length
    ) {
      safe[
        key
      ] =
        nested;
    }
  };

const mosalPayload =
  (
    source
  ) => {
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
  (
    body
  ) => {
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
            'weight',
            'bloodGroup',
            'complexion',
            'maritalStatus',
            'marriageTimeline',
            'aboutMe',
            'visibility'
          ]
        )
      );

    if (
      safe.height !==
      undefined
    ) {
      safe.height =
        optionalNumber(
          safe.height
        );
    }

    if (
      safe.weight !==
      undefined
    ) {
      safe.weight =
        optionalNumber(
          safe.weight
        );
    }

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

    if (
      body?.location &&
      typeof body.location ===
        'object' &&
      !Array.isArray(
        body.location
      )
    ) {
      safe.location =
        cleanObject({
          city:
            null,

          taluka:
            null,

          district:
            null,

          state:
            null,

          country:
            null,

          ...pick(
            body.location,
            [
              'nativePlace',
              'nativeTaluka',
              'nativeDistrict',
              'nativeState'
            ]
          )
        });
    }

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
        'kulaDevi'
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
      safe.career
        ?.annualIncome !==
      undefined
    ) {
      safe.career
        .annualIncome =
        optionalNumber(
          safe.career
            .annualIncome
        );
    }

    if (
      body?.career
        ?.workLocation &&
      typeof body.career
        .workLocation ===
        'object'
    ) {
      safe.career = {
        ...(
          safe.career ||
          {}
        ),

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
        'astrologyVisibility'
      ]
    );

    safe.privacy = {
      ...(
        safe.privacy ||
        {}
      ),

      contactAddressVisibility:
        'Private'
    };

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

    setNestedIfPresent(
      safe,
      body,
      'maternalFamily',
      [
        'maternalGrandfatherName',
        'maternalNativePlace',
        'maternalVillage',
        'maternalTaluka',
        'maternalDistrict',
        'maternalState',
        'maternalClan'
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
        ...(
          safe.contactDetails ||
          {}
        ),

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

      if (
        safe.maritalHistory
          .childrenCount !==
        undefined
      ) {
        safe.maritalHistory
          .childrenCount =
          optionalNumber(
            safe.maritalHistory
              .childrenCount
          );
      }

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
        const key of [
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
      const key of
      nestedProfileSections
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
      const key of
      nestedProfileSections
    ) {
      if (
        incoming[
          key
        ] ===
        undefined
      ) {
        continue;
      }

      profile[
        key
      ] =
        deepMerge(
          profile[
            key
          ],
          incoming[
            key
          ]
        );
    }
  };

const escapedRegex =
  (
    value
  ) =>
    new RegExp(
      String(
        value
      ).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      ),
      'i'
    );

const validateRange =
  (
    min,
    max,
    message
  ) => {
    const minimum =
      optionalNumber(
        min
      );

    const maximum =
      optionalNumber(
        max
      );

    if (
      minimum !==
        undefined &&
      maximum !==
        undefined &&
      minimum >
        maximum
    ) {
      throw new ApiError(
        400,
        message
      );
    }
  };

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
          age <
            18 ||
          age >
            80
        ) {
          throw new ApiError(
            400,
            'Date of birth must represent an age between 18 and 80.'
          );
        }
      }

      if (
        safe.height !==
          undefined &&
        (
          safe.height <
            100 ||
          safe.height >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Height must be between 100 and 250 cm.'
        );
      }

      if (
        safe.weight !==
          undefined &&
        (
          safe.weight <
            30 ||
          safe.weight >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Weight must be between 30 and 250 kg.'
        );
      }

      let profile =
        await MatrimonialProfile.findOne({
          userId:
            req.user.id
        });

      if (
        profile
      ) {
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

      /*
       * Expired boost timestamps are cleared before
       * discovery ordering.
       */
      const boostExposureNow =
        await clearExpiredProfileBoosts();

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

        ...sameSurnameMongoExclusion(
          mine
        ),

        ...(requestedGender
          ? {
              gender:
                requestedGender
            }
          : {})
      };

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
            [
              key
            ]:
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
          query[
            fieldPath
          ] =
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

        const dateOfBirth =
          {};

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
        found
          .filter(
            (
              profile
            ) =>
              !isSameSurname(
                mine,
                profile
              )
          )
          .map(
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

      const profiles =
        (
          await Promise.all(
            found.map(
              async (
                profile
              ) => {
                if (
                  isSameSurname(
                    mine,
                    profile
                  )
                ) {
                  return null;
                }

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

                  boostActive:
                    isProfileBoostActive(
                      profile,
                      boostExposureNow
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

      if (
        !profile
      ) {
        throw new ApiError(
          404,
          'Profile not found.'
        );
      }

      const owner =
        String(
          profile.userId
            ?._id ||
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
        !owner &&
        !privileged &&
        mine &&
        isSameSurname(
          mine,
          profile
        )
      ) {
        throw new ApiError(
          404,
          'Profile not found.'
        );
      }

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

        if (
          !viewed
        ) {
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
        const [
          minePreferences,
          candidatePreferences
        ] =
          await Promise.all([
            PartnerPreference.findOne({
              profileId:
                mine._id
            }),

            PartnerPreference.findOne({
              profileId:
                profile._id
            })
          ]);

        compatibility =
          calculateCompatibility(
            mine,
            minePreferences,
            profile,
            candidatePreferences
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

                    status: {
                      $in: [
                        'Pending',
                        'Accepted'
                      ]
                    }
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

      if (
        !profile
      ) {
        return ok(
          res,
          {
            preferences:
              null
          }
        );
      }

      const preferences =
        await PartnerPreference.findOne({
          profileId:
            profile._id
        });

      ok(
        res,
        {
          preferences:
            preferences ||
            {
              preferredGender:
                profile.gender ===
                  'Male'
                  ? 'Female'
                  : profile.gender ===
                      'Female'
                    ? 'Male'
                    : undefined
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
            'weightMin',
            'weightMax',
            'maritalStatus',
            'acceptedMaritalStatuses',
            'willingForRemarriage',
            'locations',
            'states',
            'countries',
            'shakhPreferences',
            'gotraPreferences',
            'vanshPreferences',
            'communityPreferences',
            'educationPreferences',
            'occupationPreferences',
            'incomePreferences',
            'dietPreferences',
            'familyTypePreferences',
            'familyValuePreferences',
            'smokingPreferences',
            'drinkingPreferences',
            'propertyPreferences',
            'marriageTimeline',
            'importance',
            'additionalPreferences'
          ]
        );

      /*
       * Explicitly cleared numeric fields must be removed from MongoDB.
       * Omitting a field is not equivalent to clearing it.
       */
      const unsetFields = {};

      const numericFields = [
        'ageMin',
        'ageMax',
        'heightMin',
        'heightMax',
        'weightMin',
        'weightMax'
      ];

      for (const key of numericFields) {
        if (
          Object.prototype.hasOwnProperty.call(req.body, key) &&
          (req.body[key] === null || req.body[key] === '')
        ) {
          unsetFields[key] = 1;
          delete safe[key];
          continue;
        }

        if (safe[key] !== undefined) {
          const numericValue = optionalNumber(safe[key]);
          if (numericValue === undefined) {
            delete safe[key];
          } else {
            safe[key] = numericValue;
          }
        }
      }

      validateRange(
        safe.ageMin,
        safe.ageMax,
        'Minimum age cannot exceed maximum age.'
      );

      validateRange(
        safe.heightMin,
        safe.heightMax,
        'Minimum height cannot exceed maximum height.'
      );

      validateRange(
        safe.weightMin,
        safe.weightMax,
        'Minimum weight cannot exceed maximum weight.'
      );

      validateRange(
        safe.incomePreferences
          ?.min,
        safe.incomePreferences
          ?.max,
        'Minimum income cannot exceed maximum income.'
      );

      if (
        safe.ageMin !==
          undefined &&
        (
          safe.ageMin <
            18 ||
          safe.ageMin >
            80
        )
      ) {
        throw new ApiError(
          400,
          'Minimum age must be between 18 and 80.'
        );
      }

      if (
        safe.ageMax !==
          undefined &&
        (
          safe.ageMax <
            18 ||
          safe.ageMax >
            80
        )
      ) {
        throw new ApiError(
          400,
          'Maximum age must be between 18 and 80.'
        );
      }

      if (
        safe.heightMin !==
          undefined &&
        (
          safe.heightMin <
            100 ||
          safe.heightMin >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Minimum height must be between 100 and 250 cm.'
        );
      }

      if (
        safe.heightMax !==
          undefined &&
        (
          safe.heightMax <
            100 ||
          safe.heightMax >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Maximum height must be between 100 and 250 cm.'
        );
      }

      if (
        safe.weightMin !==
          undefined &&
        (
          safe.weightMin <
            30 ||
          safe.weightMin >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Minimum weight must be between 30 and 250 kg.'
        );
      }

      if (
        safe.weightMax !==
          undefined &&
        (
          safe.weightMax <
            30 ||
          safe.weightMax >
            250
        )
      ) {
        throw new ApiError(
          400,
          'Maximum weight must be between 30 and 250 kg.'
        );
      }

      const arrayFields = [
        'maritalStatus',
        'acceptedMaritalStatuses',
        'locations',
        'states',
        'countries',
        'shakhPreferences',
        'gotraPreferences',
        'vanshPreferences',
        'communityPreferences',
        'educationPreferences',
        'occupationPreferences',
        'dietPreferences',
        'familyTypePreferences',
        'familyValuePreferences',
        'smokingPreferences',
        'drinkingPreferences',
        'marriageTimeline'
      ];

      for (
        const key of
        arrayFields
      ) {
        if (
          safe[
            key
          ] !==
          undefined
        ) {
          safe[
            key
          ] =
            normalizeStringArray(
              safe[
                key
              ]
            );
        }
      }

      if (
        safe.shakhPreferences ===
          undefined &&
        safe.communityPreferences
          ?.length
      ) {
        safe.shakhPreferences = [
          ...safe
            .communityPreferences
        ];
      }

      if (
        safe.incomePreferences &&
        typeof safe.incomePreferences ===
          'object'
      ) {
        const min =
          optionalNumber(
            safe
              .incomePreferences
              .min
          );

        const max =
          optionalNumber(
            safe
              .incomePreferences
              .max
          );

        safe.incomePreferences =
          cleanObject({
            min,
            max
          });
      }

      if (
        safe.propertyPreferences &&
        typeof safe.propertyPreferences ===
          'object'
      ) {
        const allowed =
          new Set([
            'Any',
            'Yes',
            'No'
          ]);

        safe.propertyPreferences = {
          ownResidence:
            allowed.has(
              safe
                .propertyPreferences
                .ownResidence
            )
              ? safe
                  .propertyPreferences
                  .ownResidence
              : 'Any',

          agricultureLand:
            allowed.has(
              safe
                .propertyPreferences
                .agricultureLand
            )
              ? safe
                  .propertyPreferences
                  .agricultureLand
              : 'Any',

          businessAssets:
            allowed.has(
              safe
                .propertyPreferences
                .businessAssets
            )
              ? safe
                  .propertyPreferences
                  .businessAssets
              : 'Any'
        };
      }

      if (
        safe.importance &&
        typeof safe.importance ===
          'object'
      ) {
        const allowedImportance =
          new Set([
            'Low',
            'Medium',
            'High',
            'Must Have'
          ]);

        const allowedKeys =
          new Set([
            'age',
            'height',
            'weight',
            'maritalStatus',
            'location',
            'shakh',
            'gotra',
            'vansh',
            'education',
            'occupation',
            'income',
            'diet',
            'familyType',
            'familyValues',
            'smoking',
            'drinking',
            'ownResidence',
            'agricultureLand',
            'businessAssets',
            'marriageTimeline'
          ]);

        const importance =
          {};

        for (
          const [
            key,
            value
          ] of Object.entries(
            safe.importance
          )
        ) {
          if (
            allowedKeys.has(
              key
            ) &&
            allowedImportance.has(
              value
            )
          ) {
            importance[
              key
            ] =
              value;
          }
        }

        safe.importance =
          importance;
      }

      if (
        safe.additionalPreferences !==
          undefined
      ) {
        safe.additionalPreferences =
          String(
            safe.additionalPreferences ||
              ''
          ).trim();

        if (
          safe.additionalPreferences.length >
          1500
        ) {
          throw new ApiError(
            400,
            'Additional preferences cannot exceed 1500 characters.'
          );
        }
      }

      const update = {
        $set: {
          ...safe,
          profileId: profile._id
        }
      };

      if (Object.keys(unsetFields).length > 0) {
        update.$unset = unsetFields;
      }

      const preferences =
        await PartnerPreference.findOneAndUpdate(
          {
            profileId:
              profile._id
          },

          update,

          {
            upsert:
              true,

            returnDocument:
              'after',

            runValidators:
              true,

            setDefaultsOnInsert:
              true
          }
        );

      profile.completionPercentage =
        completion(
          profile,
          true
        );

      profile.lastActiveAt =
        new Date();

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
            'astrologyVisibility'
          ]
        ),

        contactAddressVisibility:
          'Private'
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
      if (
        !req.file
      ) {
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
            (
              error
            ) =>
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
      if (
        !req.file
      ) {
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
          (
            galleryAsset
          ) => ({
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

      if (
        !asset
      ) {
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
          (
            galleryAsset
          ) => ({
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