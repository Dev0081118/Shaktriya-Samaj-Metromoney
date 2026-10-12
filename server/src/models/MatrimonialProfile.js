import mongoose from 'mongoose';

import Counter from './Counter.js';

const text = (
  maxlength,
  extra = {}
) => ({
  type:
    String,

  trim:
    true,

  maxlength,

  ...extra
});

const privacy = {
  photoVisibility: {
    type:
      String,

    enum: [
      'Everyone',
      'RegisteredMembers',
      'AcceptedInterests',
      'Private'
    ],

    default:
      'RegisteredMembers'
  },

  /*
   * Legacy privacy field.
   * Current contact/address serialization uses
   * contactAddressVisibility plus contact unlock.
   */
  contactVisibility: {
    type:
      String,

    enum: [
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'MutualMatches'
  },

  incomeVisibility: {
    type:
      String,

    enum: [
      'Everyone',
      'RegisteredMembers',
      'AcceptedInterests',
      'Private'
    ],

    default:
      'Private'
  },

  /*
   * Legacy fallback used by older profiles.
   * New UI uses familyOverviewVisibility.
   */
  familyVisibility: {
    type:
      String,

    enum: [
      'RegisteredMembers',
      'AcceptedInterests',
      'Private'
    ],

    default:
      'RegisteredMembers'
  },

  familyOverviewVisibility: {
    type:
      String,

    enum: [
      'RegisteredMembers',
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'AcceptedInterests'
  },

  maternalFamilyVisibility: {
    type:
      String,

    enum: [
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'AcceptedInterests'
  },

  siblingDetailsVisibility: {
    type:
      String,

    enum: [
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'AcceptedInterests'
  },

  assetVisibility: {
    type:
      String,

    enum: [
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'Private'
  },

  fullNameVisibility: {
    type:
      String,

    enum: [
      'Everyone',
      'RegisteredMembers'
    ],

    default:
      'RegisteredMembers'
  },

  astrologyVisibility: {
    type:
      String,

    enum: [
      'RegisteredMembers',
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'RegisteredMembers'
  },

  contactAddressVisibility: {
    type:
      String,

    enum: [
      'AcceptedInterests',
      'MutualMatches',
      'Private'
    ],

    default:
      'Private'
  }
};

const mosalBranch = {
  familySurname:
    text(
      120
    ),

  clanSurname:
    text(
      120
    ),

  nativeVillage:
    text(
      120
    ),

  taluka:
    text(
      120
    ),

  district:
    text(
      120
    ),

  state:
    text(
      120
    ),

  notes:
    text(
      500
    )
};

const siblingSchema = {
  name:
    text(
      100
    ),

  gender: {
    type:
      String,

    enum: [
      'Male',
      'Female',
      'Other'
    ]
  },

  relation: {
    type:
      String,

    enum: [
      'Brother',
      'Sister'
    ]
  },

  age: {
    type:
      Number,

    min:
      0,

    max:
      120
  },

  maritalStatus:
    text(
      60
    ),

  occupation:
    text(
      120
    ),

  education:
    text(
      120
    ),

  spouseName:
    text(
      100
    ),

  spouseClan:
    text(
      120
    ),

  spouseFamilySurname:
    text(
      100
    ),

  spouseNativePlace:
    text(
      120
    ),

  spouseVillage:
    text(
      120
    ),

  spouseTaluka:
    text(
      120
    ),

  spouseDistrict:
    text(
      120
    ),

  spouseState:
    text(
      120
    ),

  spouseFamilyDetails:
    text(
      400
    ),

  notes:
    text(
      400
    )
};

const propertySchema = {
  propertyName:
    text(
      160
    ),

  propertyType:
    text(
      100
    ),

  ownershipType:
    text(
      80
    ),

  cityVillage:
    text(
      120
    ),

  district:
    text(
      120
    ),

  state:
    text(
      120
    ),

  approximateArea: {
    type:
      Number,

    min:
      0,

    max:
      100000000
  },

  areaUnit: {
    type:
      String,

    enum: [
      'Sq Ft',
      'Sq Yard',
      'Vigha',
      'Acre',
      'Hectare'
    ]
  },

  notes:
    text(
      500
    )
};

const schema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'User',

        required:
          true,

        index:
          true
      },

      profileFor: {
        type:
          String,

        enum: [
          'Self',
          'Son',
          'Daughter',
          'Brother',
          'Sister',
          'Relative'
        ],

        required:
          true
      },

      profileId: {
        type:
          String,

        unique:
          true,

        index:
          true
      },

      /* -------------------------------------------------------------- */
      /* Personal                                                       */
      /* -------------------------------------------------------------- */

      firstName: {
        ...text(
          100
        ),

        required:
          true
      },

      middleName:
        text(
          100
        ),

      lastName:
        text(
          100
        ),

      gender: {
        type:
          String,

        enum: [
          'Male',
          'Female'
        ]
      },

      dateOfBirth:
        Date,

      birthDetails: {
        timeOfBirth:
          text(
            20
          ),

        city:
          text(
            120
          ),

        district:
          text(
            120
          ),

        state:
          text(
            120
          ),

        country: {
          ...text(
            120
          ),

          default:
            'India'
        }
      },

      height: {
        type:
          Number,

        min:
          100,

        max:
          250
      },

      /*
       * Body weight in kilograms.
       *
       * This is a core personal-profile field and is
       * also used by the preference matching engine.
       */
      weight: {
        type:
          Number,

        min:
          30,

        max:
          250
      },

      bloodGroup: {
        type:
          String,

        enum: [
          'A+',
          'A-',
          'B+',
          'B-',
          'AB+',
          'AB-',
          'O+',
          'O-',
          'Unknown'
        ]
      },

      complexion:
        text(
          80
        ),

      maritalStatus: {
        type:
          String,

        enum: [
          'Never Married',
          'Divorced',
          'Widowed',
          'Annulled',
          'Separated'
        ]
      },

      maritalHistory: {
        status: {
          type:
            String,

          enum: [
            'Never Married',
            'Divorced',
            'Widowed',
            'Annulled',
            'Separated'
          ]
        },

        isRemarriage:
          Boolean,

        previousMarriageEndedAt:
          Date,

        divorceFinalized:
          Boolean,

        childrenFromPreviousMarriage:
          Boolean,

        childrenCount: {
          type:
            Number,

          min:
            0,

          max:
            20
        },

        childrenLivingWith:
          text(
            120
          ),

        notes:
          text(
            600
          )
      },

      /* -------------------------------------------------------------- */
      /* Current + native location                                      */
      /* -------------------------------------------------------------- */

      location: {
        /*
         * Legacy current-location fields are retained
         * for older documents only.
         *
         * New onboarding clears these fields and exact
         * residential location lives only inside
         * contactDetails.currentAddress.
         */
        city:
          text(
            120
          ),

        taluka:
          text(
            120
          ),

        district:
          text(
            120
          ),

        state:
          text(
            120
          ),

        country: {
          ...text(
            120
          ),

          default:
            'India'
        },

        nativePlace:
          text(
            120
          ),

        nativeTaluka:
          text(
            120
          ),

        nativeDistrict:
          text(
            120
          ),

        nativeState:
          text(
            120
          )
      },

      /* -------------------------------------------------------------- */
      /* Rajput heritage                                                */
      /* -------------------------------------------------------------- */

      community: {
        religion: {
          ...text(
            80
          ),

          default:
            'Hinduism'
        },

        caste:
          text(
            100
          ),

        name:
          text(
            100
          ),

        /*
         * Legacy only.
         * New profile flow does not collect Sub-Samaj.
         */
        subCommunity:
          text(
            100
          ),

        /*
         * DB key remains clan.
         * UI calls this Surname / Shakh.
         */
        clan:
          text(
            120
          ),

        gotra:
          text(
            120
          ),

        /*
         * Free text is intentional.
         * Standard choices still come from the frontend,
         * but "Other" stores the user's actual Kul/Vansh.
         */
        vansh:
          text(
            120
          ),

        kulaDevi:
          text(
            160
          ),

        /*
         * Legacy only.
         * New profile flow no longer collects Kuldevta.
         */
        ishtaDevta:
          text(
            160
          ),

        /*
         * Legacy only.
         * New profile flow does not collect a separate
         * family-origin field.
         */
        familyOrigin:
          text(
            300
          )
      },

      /* -------------------------------------------------------------- */
      /* Education                                                      */
      /* -------------------------------------------------------------- */

      education: {
        highestEducation:
          text(
            160
          ),

        degree:
          text(
            160
          ),

        specialization:
          text(
            160
          ),

        college:
          text(
            200
          ),

        university:
          text(
            200
          ),

        educationDetails:
          text(
            800
          )
      },

      /* -------------------------------------------------------------- */
      /* Career                                                         */
      /* -------------------------------------------------------------- */

      career: {
        /*
         * Free text is intentional so an "Other"
         * employment type can save its real value.
         */
        occupationType:
          text(
            120
          ),

        occupation:
          text(
            160
          ),

        designation:
          text(
            160
          ),

        companyName:
          text(
            200
          ),

        businessName:
          text(
            200
          ),

        workLocation: {
          city:
            text(
              120
            ),

          state:
            text(
              120
            ),

          country: {
            ...text(
              120
            ),

            default:
              'India'
          }
        },

        annualIncome: {
          type:
            Number,

          min:
            0
        },

        /*
         * Legacy field.
         * Current visibility lives in privacy.incomeVisibility.
         */
        incomeVisibility:
          Boolean
      },

      /* -------------------------------------------------------------- */
      /* Lifestyle                                                      */
      /* -------------------------------------------------------------- */

      lifestyle: {
        /*
         * Free text allows custom "Other" diets.
         */
        diet:
          text(
            80
          ),

        smoking:
          text(
            80
          ),

        drinking:
          text(
            80
          ),

        interests: {
          type: [
            {
              type:
                String,

              trim:
                true,

              maxlength:
                100
            }
          ],

          validate: [
            (
              value
            ) =>
              value.length <=
              30,

            'A maximum of 30 interests is supported.'
          ]
        }
      },

      /* -------------------------------------------------------------- */
      /* Immediate family                                               */
      /* -------------------------------------------------------------- */

      family: {
        fatherName:
          text(
            120
          ),

        fatherOccupation:
          text(
            160
          ),

        motherName:
          text(
            120
          ),

        motherOccupation:
          text(
            160
          ),

        siblings:
          text(
            500
          ),

        siblingDetails: {
          type: [
            siblingSchema
          ],

          validate: [
            (
              value
            ) =>
              value.length <=
              12,

            'A maximum of 12 siblings is supported.'
          ]
        },

        familyType:
          text(
            100
          ),

        familyValues: {
          ...text(
            100
          ),

          enum: [
            'Traditional',
            'Moderate',
            'Liberal'
          ]
        },

        /*
         * Legacy only.
         * New UI no longer asks Family Residence State.
         */
        familyLocation:
          text(
            200
          ),

        familyDescription:
          text(
            1000
          )
      },

      /* -------------------------------------------------------------- */
      /* Paternal lineage                                               */
      /* -------------------------------------------------------------- */

      paternalFamily: {
        ancestralVillage:
          text(
            120
          ),

        nativePlace:
          text(
            120
          ),

        taluka:
          text(
            120
          ),

        district:
          text(
            120
          ),

        state:
          text(
            120
          ),

        familySurname:
          text(
            100
          ),

        clan:
          text(
            100
          ),

        gotra:
          text(
            100
          ),

        notes:
          text(
            600
          )
      },

      /* -------------------------------------------------------------- */
      /* Maternal family                                                */
      /* -------------------------------------------------------------- */

      maternalFamily: {
        maternalGrandfatherName:
          text(
            120
          ),

        /*
         * Legacy field.
         * New flow uses maternalClan / Maternal Shakh.
         */
        maternalFamilySurname:
          text(
            100
          ),

        maternalNativePlace:
          text(
            120
          ),

        maternalVillage:
          text(
            120
          ),

        maternalTaluka:
          text(
            120
          ),

        maternalDistrict:
          text(
            120
          ),

        maternalState:
          text(
            120
          ),

        maternalClan:
          text(
            100
          ),

        /*
         * Legacy canonical field retained so old profiles
         * remain readable, but new UI no longer collects it.
         */
        maternalGotra:
          text(
            120
          ),

        /*
         * Older records used notes for maternal Gotra.
         */
        notes:
          text(
            600
          )
      },

      /* -------------------------------------------------------------- */
      /* Three-generation Mosal                                         */
      /* -------------------------------------------------------------- */

      maternalLineage: {
        /*
         * Legacy only.
         * New onboarding no longer writes selfMosal.
         */
        selfMosal: {
          mamaName:
            text(
              120
            ),

          ...mosalBranch
        },

        fathersMosal: {
          grandmotherName:
            text(
              120
            ),

          ...mosalBranch
        },

        mothersMosal: {
          grandmotherName:
            text(
              120
            ),

          ...mosalBranch
        }
      },

      /* -------------------------------------------------------------- */
      /* Astrology                                                      */
      /* -------------------------------------------------------------- */

      astrology: {
        rashi:
          text(
            100
          ),

        nakshatra:
          text(
            100
          ),

        manglik: {
          type:
            String,

          enum: [
            'Yes',
            'No',
            'Anshik',
            'Unknown'
          ],

          default:
            'Unknown'
        }
      },

      /* -------------------------------------------------------------- */
      /* Contact / biodata address                                      */
      /* -------------------------------------------------------------- */

      contactDetails: {
        currentAddress: {
          addressLine1:
            text(
              200
            ),

          addressLine2:
            text(
              200
            ),

          city:
            text(
              120
            ),

          taluka:
            text(
              120
            ),

          district:
            text(
              120
            ),

          state:
            text(
              120
            ),

          pincode: {
            type:
              String,

            trim:
              true,

            match:
              /^[0-9]{6}$/
          },

          country: {
            ...text(
              120
            ),

            default:
              'India'
          }
        },

        guardianName:
          text(
            120
          ),

        guardianRelation:
          text(
            80
          ),

        guardianPhone:
          text(
            30
          ),

        selfPhone:
          text(
            30
          ),

        email: {
          ...text(
            254
          ),

          lowercase:
            true
        }
      },

      /* -------------------------------------------------------------- */
      /* Family assets                                                  */
      /* -------------------------------------------------------------- */

      familyAssets: {
        agricultureLand: {
          hasLand:
            Boolean,

          approximateArea: {
            type:
              Number,

            min:
              0,

            max:
              1000000
          },

          unit: {
            type:
              String,

            enum: [
              'Vigha',
              'Acre',
              'Hectare'
            ]
          },

          village:
            text(
              120
            ),

          taluka:
            text(
              120
            ),

          district:
            text(
              120
            ),

          state:
            text(
              120
            ),

          landType:
            text(
              80
            ),

          ownershipType:
            text(
              80
            ),

          notes:
            text(
              500
            )
        },

        residentialProperties: {
          type: [
            {
              ...propertySchema,

              isPrimaryResidence: {
                type:
                  Boolean,

                default:
                  false
              }
            }
          ],

          validate: [
            (
              value
            ) =>
              value.length <=
              10,

            'A maximum of 10 residential properties is supported.'
          ]
        },

        otherProperties: {
          type: [
            propertySchema
          ],

          validate: [
            (
              value
            ) =>
              value.length <=
              15,

            'A maximum of 15 other properties is supported.'
          ]
        },

        businessAssets: {
          type: [
            {
              assetName:
                text(
                  180
                ),

              assetType:
                text(
                  120
                ),

              ownershipType:
                text(
                  80
                ),

              location:
                text(
                  200
                ),

              description:
                text(
                  600
                )
            }
          ],

          validate: [
            (
              value
            ) =>
              value.length <=
              10,

            'A maximum of 10 business assets is supported.'
          ]
        },

        /*
         * Legacy only.
         * Overall Asset Summary is no longer exposed in UI.
         */
        assetSummary:
          text(
            1000
          ),

        /*
         * Legacy structured-asset migration fields.
         */
        propertySummary:
          text(
            500
          ),

        primaryResidenceType:
          text(
            100
          ),

        businessAssetsSummary:
          text(
            500
          )
      },

      /* -------------------------------------------------------------- */
      /* Biodata controls                                               */
      /* -------------------------------------------------------------- */

      biodataPrivacy: {
        includeSensitiveFamilyDetailsInBiodata: {
          type:
            Boolean,

          default:
            false
        },

        /*
         * Legacy preference retained for existing profiles.
         * New onboarding does not ask for this.
         */
        includeContactDetailsInBiodata: {
          type:
            Boolean,

          default:
            false
        },

        includeAstrologyInBiodata: {
          type:
            Boolean,

          default:
            true
        },

        includeAssetsInBiodata: {
          type:
            Boolean,

          default:
            false
        }
      },

      /* -------------------------------------------------------------- */
      /* General profile                                                */
      /* -------------------------------------------------------------- */

      marriageTimeline:
        text(
          160
        ),

      aboutMe:
        text(
          2000
        ),

      profilePhoto:
        String,

      profilePhotoPublicId:
        String,

      gallery: [
        String
      ],

      galleryAssets: [
        {
          url:
            String,

          publicId:
            String
        }
      ],

      boostedUntil:
        Date,

      lastBoostAt:
        Date,

      verification: {
        mobileVerified:
          Boolean,

        emailVerified:
          Boolean,

        photoVerified:
          Boolean,

        adminVerified:
          Boolean
      },

      privacy,

      visibility: {
        type:
          String,

        enum: [
          'draft',
          'pending_review',
          'active',
          'changes_required',
          'rejected',
          'paused',
          'hidden'
        ],

        default:
          'draft'
      },

      lifecycleStatus: {
        type:
          String,

        enum: [
          'Active',
          'Paused',
          'Married',
          'Deleted'
        ],

        default:
          'Active'
      },

      completionPercentage: {
        type:
          Number,

        default:
          0,

        min:
          0,

        max:
          100
      },

      moderationNotes:
        String,

      moderatedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'User'
      },

      moderatedAt:
        Date,

      lastActiveAt:
        Date
    },

    {
      timestamps:
        true
    }
  );

/*
 * Core listing / moderation indexes.
 */
schema.index({
  visibility:
    1,

  createdAt:
    -1
});

schema.index({
  lastActiveAt:
    -1
});

schema.index({
  gender:
    1,

  visibility:
    1,

  lifecycleStatus:
    1
});

/*
 * Discovery and recommendations use native location.
 *
 * Current residential location must not be used for
 * public matching/discovery indexes.
 */
schema.index({
  'location.nativeState':
    1,

  'location.nativeDistrict':
    1
});

schema.index({
  'community.clan':
    1,

  'community.gotra':
    1,

  'community.vansh':
    1
});

schema.index({
  maritalStatus:
    1,

  gender:
    1,

  visibility:
    1
});

schema.pre(
  'validate',
  async function () {
    if (
      this.profileId
    ) {
      return;
    }

    let counter =
      await Counter.findById(
        'profileId'
      );

    if (
      !counter
    ) {
      const last =
        await this.constructor
          .findOne(
            {
              profileId:
                /^KSM\d+$/
            },
            'profileId'
          )
          .sort({
            profileId:
              -1
          })
          .lean();

      try {
        await Counter.create({
          _id:
            'profileId',

          sequence:
            Number(
              last
                ?.profileId
                ?.slice(
                  3
                )
            ) ||
            100000
        });
      } catch {
        /*
         * Another request created
         * the counter concurrently.
         */
      }
    }

    counter =
      await Counter.findByIdAndUpdate(
        'profileId',
        {
          $inc: {
            sequence:
              1
          }
        },
        {
          returnDocument:
            'after'
        }
      );

    this.profileId =
      `KSM${counter.sequence}`;
  }
);

export default mongoose.model(
  'MatrimonialProfile',
  schema
);