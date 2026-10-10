import mongoose from 'mongoose';

import Counter from './Counter.js';

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
  familySurname: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  clanSurname: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  nativeVillage: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  taluka: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  district: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  state: {
    type:
      String,

    trim:
      true,

    maxlength:
      120
  },

  notes: {
    type:
      String,

    trim:
      true,

    maxlength:
      500
  }
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

      /* ------------------------------------------------------------------ */
      /* Personal profile                                                   */
      /* ------------------------------------------------------------------ */

      firstName: {
        type:
          String,

        trim:
          true,

        required:
          true,

        maxlength:
          100
      },

      middleName: {
        type:
          String,

        trim:
          true,

        maxlength:
          100
      },

      lastName: {
        type:
          String,

        trim:
          true,

        maxlength:
          100
      },

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
        timeOfBirth: {
          type:
            String,

          trim:
            true,

          maxlength:
            20
        },

        city: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        district: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        state: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        country: {
          type:
            String,

          trim:
            true,

          maxlength:
            120,

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

      complexion: {
        type:
          String,

        trim:
          true,

        maxlength:
          80
      },

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

        childrenLivingWith: {
          type:
            String,

          maxlength:
            120
        },

        notes: {
          type:
            String,

          maxlength:
            600
        }
      },

      /* ------------------------------------------------------------------ */
      /* Current + native location                                          */
      /* ------------------------------------------------------------------ */

      location: {
        city: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        taluka: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        district: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        state: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        country: {
          type:
            String,

          trim:
            true,

          maxlength:
            120,

          default:
            'India'
        },

        nativePlace: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        nativeTaluka: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        nativeDistrict: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        nativeState: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      },

      /* ------------------------------------------------------------------ */
      /* Rajput heritage & lineage                                          */
      /* ------------------------------------------------------------------ */

      community: {
        religion: {
          type:
            String,

          trim:
            true,

          maxlength:
            80,

          default:
            'Hinduism'
        },

        caste: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

        name: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

        subCommunity: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

        clan: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        gotra: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        vansh: {
          type:
            String,

          enum: [
            'Suryavanshi',
            'Chandravanshi',
            'Agnivanshi',
            'Other'
          ]
        },

        kulaDevi: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        ishtaDevta: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        familyOrigin: {
          type:
            String,

          trim:
            true,

          maxlength:
            300
        }
      },

      /* ------------------------------------------------------------------ */
      /* Education                                                          */
      /* ------------------------------------------------------------------ */

      education: {
        highestEducation: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        degree: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        specialization: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        college: {
          type:
            String,

          trim:
            true,

          maxlength:
            200
        },

        university: {
          type:
            String,

          trim:
            true,

          maxlength:
            200
        },

        educationDetails: {
          type:
            String,

          trim:
            true,

          maxlength:
            800
        }
      },

      /* ------------------------------------------------------------------ */
      /* Career                                                             */
      /* ------------------------------------------------------------------ */

      career: {
        occupationType: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        occupation: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        designation: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        companyName: {
          type:
            String,

          trim:
            true,

          maxlength:
            200
        },

        businessName: {
          type:
            String,

          trim:
            true,

          maxlength:
            200
        },

        workLocation: {
          city: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          state: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          country: {
            type:
              String,

            trim:
              true,

            maxlength:
              120,

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
         * Legacy field kept for compatibility.
         * Real visibility is controlled by
         * privacy.incomeVisibility.
         */
        incomeVisibility:
          Boolean
      },

      /* ------------------------------------------------------------------ */
      /* Lifestyle                                                          */
      /* ------------------------------------------------------------------ */

      lifestyle: {
        diet: {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        },

        smoking: {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        },

        drinking: {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        },

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

      /* ------------------------------------------------------------------ */
      /* Immediate family                                                   */
      /* ------------------------------------------------------------------ */

      family: {
        fatherName: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        fatherOccupation: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        motherName: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        motherOccupation: {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        },

        siblings: {
          type:
            String,

          trim:
            true,

          maxlength:
            500
        },

        siblingDetails: {
          type: [
            {
              name: {
                type:
                  String,

                maxlength:
                  100
              },

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

              maritalStatus: {
                type:
                  String,

                maxlength:
                  60
              },

              occupation: {
                type:
                  String,

                maxlength:
                  120
              },

              education: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseName: {
                type:
                  String,

                maxlength:
                  100
              },

              spouseClan: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseFamilySurname: {
                type:
                  String,

                maxlength:
                  100
              },

              spouseNativePlace: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseVillage: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseTaluka: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseDistrict: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseState: {
                type:
                  String,

                maxlength:
                  120
              },

              spouseFamilyDetails: {
                type:
                  String,

                maxlength:
                  400
              },

              notes: {
                type:
                  String,

                maxlength:
                  400
              }
            }
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

        familyType: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

        familyLocation: {
          type:
            String,

          trim:
            true,

          maxlength:
            200
        },

        familyDescription: {
          type:
            String,

          trim:
            true,

          maxlength:
            1000
        }
      },

      /* ------------------------------------------------------------------ */
      /* Paternal lineage                                                   */
      /* ------------------------------------------------------------------ */

      paternalFamily: {
        ancestralVillage: {
          type:
            String,

          maxlength:
            120
        },

        nativePlace: {
          type:
            String,

          maxlength:
            120
        },

        taluka: {
          type:
            String,

          maxlength:
            120
        },

        district: {
          type:
            String,

          maxlength:
            120
        },

        state: {
          type:
            String,

          maxlength:
            120
        },

        familySurname: {
          type:
            String,

          maxlength:
            100
        },

        clan: {
          type:
            String,

          maxlength:
            100
        },

        gotra: {
          type:
            String,

          maxlength:
            100
        },

        notes: {
          type:
            String,

          maxlength:
            600
        }
      },

      /* ------------------------------------------------------------------ */
      /* Existing maternal family summary                                   */
      /* ------------------------------------------------------------------ */

      maternalFamily: {
        maternalGrandfatherName: {
          type:
            String,

          maxlength:
            120
        },

        maternalFamilySurname: {
          type:
            String,

          maxlength:
            100
        },

        maternalNativePlace: {
          type:
            String,

          maxlength:
            120
        },

        maternalVillage: {
          type:
            String,

          maxlength:
            120
        },

        maternalTaluka: {
          type:
            String,

          maxlength:
            120
        },

        maternalDistrict: {
          type:
            String,

          maxlength:
            120
        },

        maternalState: {
          type:
            String,

          maxlength:
            120
        },

        maternalClan: {
          type:
            String,

          maxlength:
            100
        },

        notes: {
          type:
            String,

          maxlength:
            600
        }
      },

      /* ------------------------------------------------------------------ */
      /* Three-generation Mosal lineage                                     */
      /* ------------------------------------------------------------------ */

      maternalLineage: {
        /*
         * Candidate's Mosal:
         * mother's parental family.
         */
        selfMosal: {
          mamaName: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          ...mosalBranch
        },

        /*
         * Father's Mosal:
         * paternal grandmother's parental family.
         */
        fathersMosal: {
          grandmotherName: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          ...mosalBranch
        },

        /*
         * Mother's Mosal:
         * maternal grandmother's parental family.
         */
        mothersMosal: {
          grandmotherName: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          ...mosalBranch
        }
      },

      /* ------------------------------------------------------------------ */
      /* Astrology                                                          */
      /* ------------------------------------------------------------------ */

      astrology: {
        rashi: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

        nakshatra: {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        },

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

      /* ------------------------------------------------------------------ */
      /* Contact / biodata address                                          */
      /* ------------------------------------------------------------------ */

      contactDetails: {
        currentAddress: {
          addressLine1: {
            type:
              String,

            trim:
              true,

            maxlength:
              200
          },

          addressLine2: {
            type:
              String,

            trim:
              true,

            maxlength:
              200
          },

          city: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          taluka: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          district: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          state: {
            type:
              String,

            trim:
              true,

            maxlength:
              120
          },

          pincode: {
            type:
              String,

            trim:
              true,

            match:
              /^[0-9]{6}$/
          },

          country: {
            type:
              String,

            trim:
              true,

            maxlength:
              120,

            default:
              'India'
          }
        },

        guardianName: {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        },

        guardianRelation: {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        },

        guardianPhone: {
          type:
            String,

          trim:
            true,

          maxlength:
            30
        },

        selfPhone: {
          type:
            String,

          trim:
            true,

          maxlength:
            30
        },

        email: {
          type:
            String,

          trim:
            true,

          lowercase:
            true,

          maxlength:
            254
        }
      },

      /* ------------------------------------------------------------------ */
      /* Family assets                                                      */
      /* ------------------------------------------------------------------ */

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
          }
        },

        propertySummary: {
          type:
            String,

          maxlength:
            500
        },

        primaryResidenceType: {
          type:
            String,

          maxlength:
            100
        },

        businessAssetsSummary: {
          type:
            String,

          maxlength:
            500
        }
      },

      /* ------------------------------------------------------------------ */
      /* Biodata controls                                                   */
      /* ------------------------------------------------------------------ */

      biodataPrivacy: {
        includeSensitiveFamilyDetailsInBiodata: {
          type:
            Boolean,

          default:
            false
        },

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

      /* ------------------------------------------------------------------ */
      /* General profile                                                    */
      /* ------------------------------------------------------------------ */

      marriageTimeline: {
        type:
          String,

        trim:
          true,

        maxlength:
          160
      },

      aboutMe: {
        type:
          String,

        trim:
          true,

        maxlength:
          2000
      },

      profilePhoto:
        String,

      profilePhotoPublicId:
        String,

      /*
       * Legacy gallery URLs retained
       * for compatibility.
       */
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

schema.index({
  'location.state':
    1,

  'location.city':
    1
});

schema.pre(
  'validate',
  async function () {
    if (
      !this.profileId
    ) {
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
                last?.profileId?.slice(
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
  }
);

export default mongoose.model(
  'MatrimonialProfile',
  schema
);