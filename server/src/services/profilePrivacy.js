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
    context
  ) => {
    if (
      !profileObject
        .contactDetails
    ) {
      return;
    }

    /*
     * Exact residential address is NEVER
     * automatically exposed because of:
     *
     * - registered membership
     * - accepted interest
     * - mutual match
     *
     * It requires the explicit contact-request
     * approval + unlock flow for this exact viewer.
     *
     * Owner and privileged staff are handled before
     * this function is reached.
     */
    if (
      !context.contactUnlocked
    ) {
      delete profileObject
        .contactDetails;

      return;
    }

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

  p.age =
    calculateAge(
      p.dateOfBirth
    );

  delete p.moderatedBy;

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
    }

    if (!context.accepted && !context.matched) {
      delete p.familyAssets;
      delete p.maternalFamily;
      delete p.maternalLineage;
      if (p.family) {
        delete p.family.siblingDetails;
      }
    } else {
      if (
        !allowed(
          privacy.assetVisibility ||
            'AcceptedInterests',
          context
        )
      ) {
        delete p.familyAssets;
      }

      if (
        !allowed(
          privacy.maternalFamilyVisibility ||
            'AcceptedInterests',
          context
        )
      ) {
        delete p.maternalFamily;
        delete p.maternalLineage;
      }

      if (
        p.family &&
        !allowed(
          privacy.siblingDetailsVisibility ||
            'AcceptedInterests',
          context
        )
      ) {
        delete p.family.siblingDetails;
      }
    }

    if (
      !allowed(
        privacy.astrologyVisibility ||
          'AcceptedInterests',
        context
      )
    ) {
      delete p.birthDetails;
      delete p.astrology;
      delete p.horoscope;
    } else if (p.birthDetails) {
      delete p.birthDetails.dateOfBirth;
      delete p.birthDetails.exactDob;
      delete p.birthDetails.horoscope;
    }

    delete p.dateOfBirth;
    delete p.horoscope;

    if (
      !context.accepted &&
      !context.matched
    ) {
      delete p.maritalHistory;
    }

    /*
     * Exact address requires explicit
     * contact access for this viewer.
     *
     * A mutual match alone is not sufficient.
     */
    sanitizeContactDetails(
      p,
      context
    );

    delete p.biodataPrivacy;

    /*
     * Phone and email use the same explicit
     * contact unlock requirement.
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

    delete p.userId;
  }

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