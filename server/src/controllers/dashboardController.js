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

/*
 * Dashboard is a recommendation surface,
 * not a generic discovery surface.
 *
 * Profiles below this directional preference-fit
 * score are not shown in dashboard recommendations.
 */
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

      /*
       * Membership information is useful even before
       * the member creates a matrimonial profile.
       */
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

      /*
       * Member has an account but has not created their
       * matrimonial profile yet.
       */
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

      /*
       * Blocking must work in both directions.
       *
       * 1. Profiles I blocked.
       * 2. Profiles belonging to users who blocked me.
       */
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

      /*
       * Always recalculate completion using the current
       * profile rules.
       *
       * This self-heals records saved before Weight,
       * Residential Address and Mosal completion rules
       * were introduced.
       */
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

      /*
       * Preferred gender comes from explicit partner
       * preference first.
       *
       * Otherwise we retain the current heterosexual
       * default used by the existing app.
       */
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
       * Pull a reasonable candidate pool first.
       *
       * Do NOT put detailed preference filtering into
       * the Mongo query because:
       *
       * - soft preferences should not exclude people;
       * - Must Have behavior belongs to the engine;
       * - missing data needs UNKNOWN handling;
       * - reciprocal preferences must also be evaluated.
       */
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

          ...(preferred
            ? {
                gender:
                  preferred
              }
            : {})
        })
          .sort({
            /*
             * These fields only choose the initial pool.
             * Final recommendation ordering happens using
             * compatibility.rankingScore below.
             */
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

      /*
       * Bulk-load related data.
       *
       * Avoid one DB request per recommendation.
       */
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

      /*
       * Recommendations are intentionally built from
       * RAW server-side candidate documents first.
       *
       * That allows private values such as income or
       * family assets to participate in matching when
       * appropriate without exposing those raw values
       * to the frontend.
       */
      const evaluatedCandidates =
        candidates
          .map(
            (
              candidate
            ) => {
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

              /*
               * Candidate must pass Must Have criteria
               * from BOTH directions.
               */
              if (
                !compatibility
                  .eligible
              ) {
                return null;
              }

              /*
               * Logged-in member must actually have
               * evaluatable preference criteria.
               *
               * Without preferences we should not show a
               * fake compatibility percentage.
               */
              if (
                !compatibility
                  .viewerHasPreferences
              ) {
                return null;
              }

              /*
               * If no directional score could be
               * calculated, this is not a recommendation.
               */
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

              /*
               * Dashboard displays only meaningfully
               * compatible profiles.
               */
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
       * Final ranking:
       *
       * compatibility.rankingScore =
       * 70% viewer preference fit
       * +
       * 30% reciprocal mutual compatibility
       *
       * A tiny verification/activity tie-breaker is used
       * only after compatibility.
       */
      evaluatedCandidates.sort(
        (
          left,
          right
        ) => {
          const compatibilityDifference =
            (
              right
                .compatibility
                .rankingScore ||
              0
            ) -
            (
              left
                .compatibility
                .rankingScore ||
              0
            );

          if (
            compatibilityDifference !==
            0
          ) {
            return compatibilityDifference;
          }

          const rightVerified =
            right.candidate
              .verification
              ?.adminVerified
              ? 1
              : 0;

          const leftVerified =
            left.candidate
              .verification
              ?.adminVerified
              ? 1
              : 0;

          if (
            rightVerified !==
            leftVerified
          ) {
            return (
              rightVerified -
              leftVerified
            );
          }

          const rightActive =
            right.candidate
              .lastActiveAt
              ? new Date(
                  right.candidate
                    .lastActiveAt
                ).getTime()
              : 0;

          const leftActive =
            left.candidate
              .lastActiveAt
              ? new Date(
                  left.candidate
                    .lastActiveAt
                ).getTime()
              : 0;

          return (
            rightActive -
            leftActive
          );
        }
      );

      const topCandidates =
        evaluatedCandidates.slice(
          0,
          MAX_RECOMMENDATIONS
        );

      /*
       * Apply privacy serialization only after the
       * server-side score has been calculated.
       *
       * This ensures private matching inputs never need
       * to be included in the response payload.
       */
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

          /*
           * Useful for the frontend when the member has
           * not configured preferences yet.
           */
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