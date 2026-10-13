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
  clearExpiredProfileBoosts,
  compareRecommendationExposure,
  isProfileBoostActive
} from '../services/boostExposureService.js';

import {
  asyncHandler,
  ok
} from '../utils/http.js';

import {
  calculateCompatibility,
  completion,
  profileCard
} from '../utils/profile.js';

import {
  isSameSurname,
  sameSurnameMongoExclusion
} from '../utils/communityRules.js';

const MIN_RECOMMENDATION_SCORE =
  50;

const MAX_RECOMMENDATIONS =
  3;

const CANDIDATE_POOL_SIZE =
  50;

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
                  entitlements
                    .subscription
                    .status,

                startsAt:
                  entitlements
                    .subscription
                    .startsAt,

                endsAt:
                  entitlements
                    .subscription
                    .endsAt
              }
            : null,

        features: {
          interestLimit:
            entitlements
              .interestLimit,

          contactViewLimit:
            entitlements
              .contactViewLimit,

          advancedSearch:
            !!entitlements
              .advancedSearch,

          profileBoost:
            !!entitlements
              .profileBoost,

          prioritySupport:
            !!entitlements
              .prioritySupport,

          relationshipManager:
            !!entitlements
              .relationshipManager
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
              entitlements
                .interestLimit,

              usage.interestsUsed
            ),

          contactViewsRemaining:
            remainingLimit(
              entitlements
                .contactViewLimit,

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

            lifecycleStatus:
              null,

            membership
          }
        );
      }

      const since =
        new Date(
          Date.now() -
            30 *
              24 *
              60 *
              60 *
              1000
        );

      const [
        myBlockedProfileIds,
        usersWhoBlockedMe
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
              profile._id
          }).distinct(
            'user'
          )
        ]);

      const blockedByProfileIds =
        usersWhoBlockedMe.length
          ? await MatrimonialProfile.find({
              userId: {
                $in:
                  usersWhoBlockedMe
              }
            }).distinct(
              '_id'
            )
          : [];

      const [
        newInterestsCount,
        mutualMatchesCount,
        shortlistCount,
        unreadNotificationsCount,
        profileViewsLast30Days,
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

          PartnerPreference.findOne({
            profileId:
              profile._id
          })
        ]);

      const profileCompletion =
        completion(
          profile,
          !!myPref
        );

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

      /*
       * Expired boosts must become normal profiles again
       * before candidate sorting.
       */
      const boostRankingNow =
        await clearExpiredProfileBoosts();

      const candidates =
        await MatrimonialProfile.find({
          visibility:
            'active',

          lifecycleStatus:
            'Active',

          _id: {
            $nin: [
              profile._id,

              ...myBlockedProfileIds,

              ...blockedByProfileIds
            ]
          },

          ...sameSurnameMongoExclusion(
            profile
          ),

          ...(preferred
            ? {
                gender:
                  preferred
              }
            : {})
        })
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
          .limit(
            CANDIDATE_POOL_SIZE
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

      const evaluatedCandidates =
        candidates
          .map(
            (
              candidate
            ) => {
              if (
                isSameSurname(
                  profile,
                  candidate
                )
              ) {
                return null;
              }

              const candidatePreference =
                preferenceMap.get(
                  String(
                    candidate._id
                  )
                ) ||
                null;

              const compatibility =
                calculateCompatibility(
                  profile,
                  myPref,
                  candidate,
                  candidatePreference
                );

              if (
                !compatibility
                  .eligible
              ) {
                return null;
              }

              if (
                !compatibility
                  .viewerHasPreferences
              ) {
                return null;
              }

              if (
                compatibility
                  .score ===
                  null ||
                compatibility
                  .score ===
                  undefined
              ) {
                return null;
              }

              if (
                compatibility
                  .score <
                MIN_RECOMMENDATION_SCORE
              ) {
                return null;
              }

              return {
                candidate,

                compatibility
              };
            }
          )
          .filter(
            Boolean
          );

      /*
       * Compatibility remains primary.
       *
       * Boost gets priority only when candidates are
       * already inside the small quality window defined
       * by boostExposureService.
       */
      evaluatedCandidates.sort(
        (
          left,
          right
        ) =>
          compareRecommendationExposure(
            left,
            right,
            boostRankingNow
          )
      );

      const topCandidates =
        evaluatedCandidates.slice(
          0,
          MAX_RECOMMENDATIONS
        );

      const recommended =
        (
          await Promise.all(
            topCandidates.map(
              async (
                {
                  candidate,
                  compatibility
                }
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

                const candidateId =
                  String(
                    candidate._id
                  );

                return {
                  ...profileCard(
                    serialized,
                    compatibility
                  ),

                  boostActive:
                    isProfileBoostActive(
                      candidate,
                      boostRankingNow
                    ),

                  interestSent:
                    interestMap.has(
                      candidateId
                    ),

                  interestStatus:
                    interestMap.get(
                      candidateId
                    ) ||
                    null,

                  shortlisted:
                    shortlistSet.has(
                      candidateId
                    )
                };
              }
            )
          )
        ).filter(
          Boolean
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

          recommendationState: {
            hasPreferences:
              !!myPref,

            minimumScore:
              MIN_RECOMMENDATION_SCORE,

            totalQualified:
              evaluatedCandidates.length
          },

          profileStatus:
            profile.visibility,

          lifecycleStatus:
            profile.lifecycleStatus,

          membership
        }
      );
    }
  );