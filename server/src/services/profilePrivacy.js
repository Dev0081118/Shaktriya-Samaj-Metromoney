import {
  Interest,
  Match
} from '../models/Interaction.js';

import {
  Block
} from '../models/Platform.js';

import {
  ContactRequest
} from '../models/Business.js';

import {
  calculateAge
} from '../utils/profile.js';

import {
  mediaService
} from './mediaService.js';

const allowed =
  (
    rule,
    {
      registered,
      accepted,
      matched
    }
  ) =>
    rule ===
      'Everyone' ||
    (
      rule ===
        'RegisteredMembers' &&
      registered
    ) ||
    (
      rule ===
        'AcceptedInterests' &&
      accepted
    ) ||
    (
      rule ===
        'MutualMatches' &&
      matched
    );

export async function relationshipContext(
  profile,
  viewer
) {
  const owner =
      String(
        profile.userId?._id ||
          profile.userId
      ) ===
      String(
        viewer._id
      ),

    privileged =
      [
        'admin',
        'moderator',
        'super_admin'
      ].includes(
        viewer.role
      );

  if (
    owner ||
    privileged
  ) {
    return {
      owner,
      privileged,
      registered:
        true,
      accepted:
        true,
      matched:
        true,
      contactUnlocked:
        true,
      blocked:
        false
    };
  }

  const viewerProfile =
    await profile.constructor
      .findOne({
        userId:
          viewer._id
      })
      .select(
        '_id'
      );

  if (
    !viewerProfile
  ) {
    return {
      owner:
        false,

      privileged:
        false,

      registered:
        true,

      accepted:
        false,

      matched:
        false,

      blocked:
        false,

      contactUnlocked:
        false
    };
  }

  const [
    blocked,
    accepted,
    matched,
    contactRequest
  ] =
    await Promise.all([
      Block.exists({
        $or: [
          {
            user:
              viewer._id,

            blockedProfile:
              profile._id
          },

          {
            user:
              profile.userId?._id ||
              profile.userId,

            blockedProfile:
              viewerProfile._id
          }
        ]
      }),

      Interest.exists({
        status:
          'Accepted',

        $or: [
          {
            senderProfile:
              viewerProfile._id,

            receiverProfile:
              profile._id
          },

          {
            senderProfile:
              profile._id,

            receiverProfile:
              viewerProfile._id
          }
        ]
      }),

      Match.exists({
        pairKey: [
          String(
            viewerProfile._id
          ),

          String(
            profile._id
          )
        ]
          .sort()
          .join(
            ':'
          ),

        status:
          'Active'
      }),

      ContactRequest.findOne({
        status:
          'Accepted',

        $or: [
          {
            requesterProfile:
              viewerProfile._id,

            receiverProfile:
              profile._id
          },

          {
            requesterProfile:
              profile._id,

            receiverProfile:
              viewerProfile._id
          }
        ]
      }).lean()
    ]);

  const contactUnlocked =
    !!contactRequest &&
    (
      String(
        contactRequest
          .requesterProfile
      ) ===
      String(
        viewerProfile._id
      )
        ? !!contactRequest
            .requesterUnlockedAt
        : !!contactRequest
            .receiverUnlockedAt
    );

  return {
    owner:
      false,

    privileged:
      false,

    registered:
      true,

    accepted:
      !!accepted,

    matched:
      !!matched,

    contactUnlocked,

    blocked:
      !!blocked
  };
}

const secureProfileMedia =
  (
    profileObject
  ) => {
    if (
      profileObject
        .profilePhoto
    ) {
      profileObject.profilePhoto =
        mediaService.accessUrl({
          publicId:
            profileObject
              .profilePhotoPublicId,

          url:
            profileObject
              .profilePhoto
        });
    }

    if (
      Array.isArray(
        profileObject
          .galleryAssets
      )
    ) {
      profileObject.galleryAssets =
        profileObject.galleryAssets
          .map(
            (
              asset
            ) => {
              const secureUrl =
                mediaService.accessUrl({
                  publicId:
                    asset.publicId,

                  url:
                    asset.url
                });

              if (
                !secureUrl
              ) {
                return null;
              }

              return {
                _id:
                  asset._id,

                url:
                  secureUrl
              };
            }
          )
          .filter(
            Boolean
          );
    }

    /*
     * Storage IDs are never client-facing.
     */
    delete profileObject
      .profilePhotoPublicId;

    return profileObject;
  };

const removeBirthAndAstrologyDetails =
  (
    profileObject
  ) => {
    delete profileObject
      .dateOfBirth;

    delete profileObject
      .birthDetails;

    delete profileObject
      .astrology;
  };

const sanitizeContactDetails =
  (
    profileObject,
    context,
    privacy
  ) => {
    if (
      !profileObject
        .contactDetails
    ) {
      return;
    }

    const contactRule =
      privacy
        .contactAddressVisibility ||
      'Private';

    /*
     * Structured contact/address data
     * requires BOTH:
     *
     * 1. contact unlock
     * 2. privacy rule permission
     *
     * Owner/admins bypass these checks.
     */
    if (
      !context.contactUnlocked ||
      !allowed(
        contactRule,
        context
      )
    ) {
      delete profileObject
        .contactDetails;

      return;
    }

    /*
     * Even after contact unlock,
     * only expose fields the member
     * intentionally stored.
     */
    profileObject.contactDetails = {
      ...profileObject
        .contactDetails
    };
  };

export async function serializeProfileForViewer(
  profile,
  viewer
) {
  const p =
      profile.toObject
        ? profile.toObject()
        : structuredClone(
            profile
          ),

    context =
      await relationshipContext(
        profile,
        viewer
      );

  if (
    context.blocked
  ) {
    return null;
  }

  const privacy =
    p.privacy ||
    {};

  /*
   * Age is safe to expose according to
   * the existing product behavior.
   */
  p.age =
    calculateAge(
      p.dateOfBirth
    );

  delete p.moderatedBy;

  /*
   * CRITICAL:
   *
   * Existing behavior removed dateOfBirth
   * for EVERYONE, including the owner.
   *
   * That broke Edit Profile because
   * /profiles/me could never return DOB.
   *
   * Owner and privileged staff retain the
   * real date so forms/admin tools can work.
   */
  if (
    !context.owner &&
    !context.privileged
  ) {
    delete p.dateOfBirth;
  }

  if (
    !context.owner &&
    !context.privileged
  ) {
    if (
      !allowed(
        privacy.photoVisibility ||
          'RegisteredMembers',
        context
      )
    ) {
      p.profilePhoto =
        null;

      p.gallery =
        [];

      p.galleryAssets =
        [];

      delete p.profilePhotoPublicId;
    }

    if (
      !allowed(
        privacy.fullNameVisibility ||
          'RegisteredMembers',
        context
      )
    ) {
      delete p.lastName;
      delete p.middleName;
    }

    if (
      !allowed(
        privacy.incomeVisibility ||
          'Private',
        context
      ) &&
      p.career
    ) {
      delete p.career
        .annualIncome;
    }

    /*
     * Family overview controls:
     * immediate family + paternal family.
     */
    const familyRule =
      privacy
        .familyOverviewVisibility ||
      privacy
        .familyVisibility ||
      'AcceptedInterests';

    if (
      !allowed(
        familyRule,
        context
      )
    ) {
      delete p.family;
      delete p.paternalFamily;
    } else if (
      p.family &&
      !allowed(
        privacy
          .siblingDetailsVisibility ||
          'AcceptedInterests',
        context
      )
    ) {
      delete p.family
        .siblingDetails;
    }

    /*
     * Maternal family and all three Mosal
     * lineage branches use the same
     * dedicated maternal privacy rule.
     */
    if (
      !allowed(
        privacy
          .maternalFamilyVisibility ||
          'AcceptedInterests',
        context
      )
    ) {
      delete p.maternalFamily;
      delete p.maternalLineage;
    }

    /*
     * Family/property assets remain
     * private unless specifically enabled.
     */
    if (
      !allowed(
        privacy.assetVisibility ||
          'Private',
        context
      )
    ) {
      delete p.familyAssets;
    }

    /*
     * Birth-time/place and astrology
     * are controlled together.
     */
    if (
      !allowed(
        privacy.astrologyVisibility ||
          'RegisteredMembers',
        context
      )
    ) {
      delete p.birthDetails;
      delete p.astrology;
    }

    /*
     * Exact DOB itself is not exposed to
     * other members. They receive age.
     */
    delete p.dateOfBirth;

    /*
     * Previous-marriage legal/children
     * details require an accepted interest
     * or mutual match.
     */
    if (
      !context.accepted &&
      !context.matched
    ) {
      delete p.maritalHistory;
    }

    /*
     * Contact details use their own
     * privacy gate + contact unlock.
     */
    sanitizeContactDetails(
      p,
      context,
      privacy
    );

    /*
     * Biodata generation switches are
     * owner configuration, not public
     * profile information.
     */
    delete p.biodataPrivacy;

    /*
     * Existing account-level phone/email
     * unlock flow stays intact.
     */
    if (
      context.contactUnlocked &&
      p.userId &&
      typeof p.userId ===
        'object'
    ) {
      p.contact = {
        email:
          p.userId.email,

        phone:
          p.userId.phone,

        whatsappPhone:
          p.userId.phone
            ?.replace(
              /\D/g,
              ''
            )
      };
    }

    /*
     * Never expose the underlying User
     * document to another member.
     */
    delete p.userId;
  }

  /*
   * Defensive rule:
   *
   * If a non-owner ever reaches this
   * point without astrology permission,
   * exact birth details must still be
   * unavailable.
   */
  if (
    !context.owner &&
    !context.privileged &&
    !allowed(
      privacy.astrologyVisibility ||
        'RegisteredMembers',
      context
    )
  ) {
    removeBirthAndAstrologyDetails(
      p
    );
  }

  /*
   * Only generate temporary media URLs
   * AFTER all privacy decisions.
   */
  if (
    p.profilePhoto ||
    (
      Array.isArray(
        p.galleryAssets
      ) &&
      p.galleryAssets
        .length >
        0
    )
  ) {
    secureProfileMedia(
      p
    );
  } else {
    delete p.profilePhotoPublicId;
  }

  return p;
}