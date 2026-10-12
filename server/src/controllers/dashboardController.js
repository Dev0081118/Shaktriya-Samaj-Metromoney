import MatrimonialProfile from '../models/MatrimonialProfile.js';

import PartnerPreference from '../models/PartnerPreference.js';

import {
  Interest,
  Match,
  Shortlist
} from '../models/Interaction.js';

import {
  Notification,
  Block
} from '../models/Platform.js';

import {
  ProfileView
} from '../models/Business.js';

import {
  getUsage,
  getUserEntitlements
} from '../services/entitlementService.js';

import {
  serializeProfileForViewer
} from '../services/profilePrivacy.js';

import {
  asyncHandler,
  ok
} from '../utils/http.js';

import {
  calculateCompatibility,
  completion,
  profileCard
} from '../utils/profile.js';

const remainingLimit = (
  limit,
  used
) => {
  if (
    limit ===
      undefined ||
    limit ===
      null
  ) {
    return 0;
  }

  if (
    limit <
      0 ||
    limit >=
      999
  ) {
    return null;
  }

  return Math.max(
    0,
    limit -
      Number(
        used ||
          0
      )
  );
};

export const dashboard =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await MatrimonialProfile.findOne({
          userId:
            req.user.id
        });

      const entitlements =
        await getUserEntitlements(
          req.user.id
        );

      const usage =
        await getUsage(
          req.user.id,
          entitlements
        );

      const membership = {
        plan: {
          name:
            entitlements.plan
              ?.name ||
            'Free',

          slug:
            entitlements.plan
              ?.slug ||
            'free'
        },

        subscription:
          entitlements.subscription
            ? {
                status:
                  entitlements.subscription
                    .status,

                startsAt:
                  entitlements.subscription
                    .startsAt,

                endsAt:
                  entitlements.subscription
                    .endsAt
              }
            : null,

        features: {
          interestLimit:
            entitlements.interestLimit,

          contactViewLimit:
            entitlements.contactViewLimit,

          advancedSearch:
            !!entitlements.advancedSearch,

          profileBoost:
            !!entitlements.profileBoost,

          prioritySupport:
            !!entitlements.prioritySupport,

          relationshipManager:
            !!entitlements.relationshipManager
        },

        usage: {
          interestsUsed:
            Number(
              usage.interestsUsed ||
                0
            ),

          contactViewsUsed:
            Number(
              usage.contactViewsUsed ||
                0
            ),

          interestsRemaining:
            remainingLimit(
              entitlements.interestLimit,
              usage.interestsUsed
            ),

          contactViewsRemaining:
            remainingLimit(
              entitlements.contactViewLimit,
              usage.contactViewsUsed
            )
        }
      };

      if (
        !profile
      ) {
        return ok(
          res,
          {
            profile:
              null,

            profileCompletion:
              0,

            newInterestsCount:
              0,

            mutualMatchesCount:
              0,

            shortlistCount:
              0,

            unreadNotificationsCount:
              0,

            profileViewsLast30Days:
              0,

            recommendedProfiles:
              [],

            profileStatus:
              'not_created',

            membership
          }
        );
      }

      const since =
        new Date(
          Date.now() -
            30 *
              864e5
        );

      const [
        newInterestsCount,
        mutualMatchesCount,
        shortlistCount,
        unreadNotificationsCount,
        profileViewsLast30Days,
        blocked,
        myPref
      ] =
        await Promise.all([
          Interest.countDocuments({
            receiverProfile:
              profile._id,

            status:
              'Pending'
          }),

          Match.countDocuments({
            status:
              'Active',

            $or: [
              {
                profileA:
                  profile._id
              },

              {
                profileB:
                  profile._id
              }
            ]
          }),

          Shortlist.countDocuments({
            userProfile:
              profile._id
          }),

          Notification.countDocuments({
            user:
              req.user.id,

            read:
              false
          }),

          ProfileView.countDocuments({
            viewedProfile:
              profile._id,

            viewDate: {
              $gte:
                since
            }
          }),

          Block.find({
            user:
              req.user.id
          }).distinct(
            'blockedProfile'
          ),

          PartnerPreference.findOne({
            profileId:
              profile._id
          })
        ]);

      /*
       * Never trust an old stored percentage here.
       *
       * Some existing records were calculated before
       * Current City / Current State were removed from
       * onboarding. Recalculate using the current
       * canonical profile-completion rules.
       */
      const profileCompletion =
        completion(
          profile,
          !!myPref
        );

      /*
       * Self-heal legacy completion values so other
       * screens reading completionPercentage also
       * receive the corrected value later.
       */
      if (
        profile.completionPercentage !==
        profileCompletion
      ) {
        profile.completionPercentage =
          profileCompletion;

        await profile.save();
      }

      const preferred =
        myPref
          ?.preferredGender ||
        (
          profile.gender ===
          'Male'
            ? 'Female'
            : profile.gender ===
                'Female'
              ? 'Male'
              : null
        );

      const candidates =
        await MatrimonialProfile.find({
          visibility:
            'active',

          lifecycleStatus:
            'Active',

          _id: {
            $nin: [
              profile._id,
              ...blocked
            ]
          },

          ...(preferred
            ? {
                gender:
                  preferred
              }
            : {})
        })
          .sort({
            updatedAt:
              -1
          })
          .limit(
            30
          );

      const candidateIds =
        candidates.map(
          (
            candidate
          ) =>
            candidate._id
        );

      const [
        candidatePreferences,
        sentInterests,
        shortlistedProfiles
      ] =
        candidateIds.length
          ? await Promise.all([
              PartnerPreference.find({
                profileId: {
                  $in:
                    candidateIds
                }
              }),

              Interest.find({
                senderProfile:
                  profile._id,

                receiverProfile: {
                  $in:
                    candidateIds
                },

                status: {
                  $in: [
                    'Pending',
                    'Accepted'
                  ]
                }
              }).select(
                'receiverProfile status'
              ),

              Shortlist.find({
                userProfile:
                  profile._id,

                shortlistedProfile: {
                  $in:
                    candidateIds
                }
              }).select(
                'shortlistedProfile'
              )
            ])
          : [
              [],
              [],
              []
            ];

      const preferenceMap =
        new Map(
          candidatePreferences.map(
            (
              preference
            ) => [
              String(
                preference.profileId
              ),

              preference
            ]
          )
        );

      const interestMap =
        new Map(
          sentInterests.map(
            (
              interest
            ) => [
              String(
                interest.receiverProfile
              ),

              interest.status
            ]
          )
        );

      const shortlistSet =
        new Set(
          shortlistedProfiles.map(
            (
              item
            ) =>
              String(
                item.shortlistedProfile
              )
          )
        );

      const recommended =
        (
          await Promise.all(
            candidates.map(
              async (
                candidate
              ) => {
                const serialized =
                  await serializeProfileForViewer(
                    candidate,
                    req.user
                  );

                if (
                  !serialized
                ) {
                  return null;
                }

                const card =
                  profileCard(
                    serialized,

                    calculateCompatibility(
                      profile,
                      myPref,
                      candidate,
                      preferenceMap.get(
                        String(
                          candidate._id
                        )
                      ) ||
                        null
                    )
                  );

                return {
                  ...card,

                  interestSent:
                    interestMap.has(
                      String(
                        candidate._id
                      )
                    ),

                  interestStatus:
                    interestMap.get(
                      String(
                        candidate._id
                      )
                    ) ||
                    null,

                  shortlisted:
                    shortlistSet.has(
                      String(
                        candidate._id
                      )
                    )
                };
              }
            )
          )
        )
          .filter(
            Boolean
          )
          .sort(
            (
              a,
              b
            ) =>
              (
                b.compatibility
                  ?.score ||
                0
              ) -
              (
                a.compatibility
                  ?.score ||
                0
              )
          )
          .slice(
            0,
            3
          );

      return ok(
        res,
        {
          profile:
            profileCard(
              profile
            ),

          profileCompletion,

          newInterestsCount,

          mutualMatchesCount,

          shortlistCount,

          unreadNotificationsCount,

          profileViewsLast30Days,

          recommendedProfiles:
            recommended,

          profileStatus:
            profile.visibility,

          lifecycleStatus:
            profile.lifecycleStatus,

          membership
        }
      );
    }
  );