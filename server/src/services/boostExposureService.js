import MatrimonialProfile from '../models/MatrimonialProfile.js';

/*
 * Boost exposure rules
 * --------------------------------------------------
 *
 * Boost changes visibility/exposure only.
 *
 * It MUST NOT:
 * - change compatibility percentage
 * - bypass same-surname rules
 * - bypass blocks
 * - bypass Must-Have failures
 * - make inactive/paused profiles visible
 * - change the profile's organic updatedAt timestamp
 *
 * Why updatedAt must not change:
 * --------------------------------------------------
 * Discover uses normal profile activity/update data as part
 * of its non-boost ordering.
 *
 * If activating or expiring a boost updates updatedAt, the
 * profile can remain artificially high even after the boost
 * has expired.
 *
 * Therefore all boost-only writes to MatrimonialProfile must
 * use timestamps: false.
 */

export const BOOST_COMPATIBILITY_WINDOW =
  5;

export const clearExpiredProfileBoosts =
  async () => {
    const now =
      new Date();

    /*
     * IMPORTANT:
     *
     * Clearing an expired boost is system bookkeeping.
     * It is NOT a real profile edit.
     *
     * `timestamps: false` prevents Mongoose from changing
     * updatedAt. Without this, an expired profile could look
     * freshly updated and remain higher in Discover.
     */
    await MatrimonialProfile.updateMany(
      {
        boostedUntil: {
          $ne:
            null,

          $lte:
            now
        }
      },

      {
        $set: {
          boostedUntil:
            null
        }
      },

      {
        timestamps:
          false
      }
    );

    return now;
  };

export const isProfileBoostActive =
  (
    profile,
    now =
      new Date()
  ) => {
    if (
      !profile?.boostedUntil
    ) {
      return false;
    }

    return (
      new Date(
        profile.boostedUntil
      ).getTime() >
      now.getTime()
    );
  };

export const compareRecommendationExposure =
  (
    left,
    right,
    now =
      new Date()
  ) => {
    const leftScore =
      Number(
        left
          ?.compatibility
          ?.rankingScore ||
          0
      );

    const rightScore =
      Number(
        right
          ?.compatibility
          ?.rankingScore ||
          0
      );

    const scoreDifference =
      rightScore -
      leftScore;

    const withinBoostWindow =
      Math.abs(
        scoreDifference
      ) <=
      BOOST_COMPATIBILITY_WINDOW;

    /*
     * Boost only affects exposure while it is ACTIVE.
     *
     * Once boostedUntil is in the past / cleared,
     * isProfileBoostActive returns false and the profile
     * immediately goes back to normal recommendation
     * ordering.
     */
    if (
      withinBoostWindow
    ) {
      const leftBoosted =
        isProfileBoostActive(
          left.candidate,
          now
        )
          ? 1
          : 0;

      const rightBoosted =
        isProfileBoostActive(
          right.candidate,
          now
        )
          ? 1
          : 0;

      if (
        leftBoosted !==
        rightBoosted
      ) {
        return (
          rightBoosted -
          leftBoosted
        );
      }
    }

    if (
      scoreDifference !==
      0
    ) {
      return scoreDifference;
    }

    const rightVerified =
      right.candidate
        ?.verification
        ?.adminVerified
        ? 1
        : 0;

    const leftVerified =
      left.candidate
        ?.verification
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
        ?.lastActiveAt
        ? new Date(
            right.candidate
              .lastActiveAt
          ).getTime()
        : 0;

    const leftActive =
      left.candidate
        ?.lastActiveAt
        ? new Date(
            left.candidate
              .lastActiveAt
          ).getTime()
        : 0;

    return (
      rightActive -
      leftActive
    );
  };