import mongoose from 'mongoose';

const IMPORTANCE_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Must Have'
];

const MARITAL_STATUSES = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Annulled',
  'Separated'
];

const YES_NO_ANY = [
  'Any',
  'Yes',
  'No'
];

const importanceSchema = {
  age: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  height: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  weight: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  maritalStatus: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  location: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  shakh: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  gotra: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  vansh: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  education: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  occupation: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  income: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  diet: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  familyType: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  familyValues: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  smoking: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  drinking: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  ownResidence: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  agricultureLand: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  businessAssets: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  },

  marriageTimeline: {
    type:
      String,

    enum:
      IMPORTANCE_LEVELS,

    default:
      'Medium'
  }
};

const schema =
  new mongoose.Schema(
    {
      profileId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'MatrimonialProfile',

        required:
          true,

        unique:
          true,

        index:
          true
      },

      preferredGender: {
        type:
          String,

        enum: [
          'Male',
          'Female'
        ]
      },

      /* ------------------------------------------------------------ */
      /* Core physical preferences                                    */
      /* ------------------------------------------------------------ */

      ageMin: {
        type:
          Number,

        min:
          18,

        max:
          80
      },

      ageMax: {
        type:
          Number,

        min:
          18,

        max:
          80
      },

      heightMin: {
        type:
          Number,

        min:
          100,

        max:
          250
      },

      heightMax: {
        type:
          Number,

        min:
          100,

        max:
          250
      },

      weightMin: {
        type:
          Number,

        min:
          30,

        max:
          250
      },

      weightMax: {
        type:
          Number,

        min:
          30,

        max:
          250
      },

      /* ------------------------------------------------------------ */
      /* Marital preferences                                          */
      /* ------------------------------------------------------------ */

      /*
       * Legacy field retained for old records.
       */
      maritalStatus: [
        {
          type:
            String,

          enum:
            MARITAL_STATUSES
        }
      ],

      acceptedMaritalStatuses: [
        {
          type:
            String,

          enum:
            MARITAL_STATUSES
        }
      ],

      willingForRemarriage: {
        type:
          String,

        enum: [
          'Yes',
          'No',
          'Open to Discuss'
        ],

        default:
          'Open to Discuss'
      },

      /* ------------------------------------------------------------ */
      /* Native-location preferences                                  */
      /* ------------------------------------------------------------ */

      /*
       * Locations means preferred native place / district /
       * region.
       *
       * Exact current residential location is never used by
       * the recommendation engine.
       */
      locations: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      states: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      countries: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      /* ------------------------------------------------------------ */
      /* Rajput heritage preferences                                  */
      /* ------------------------------------------------------------ */

      shakhPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      gotraPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      vanshPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      /*
       * Legacy field retained so old preference documents
       * continue to work.
       *
       * New writes should use shakhPreferences.
       */
      communityPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            120
        }
      ],

      /* ------------------------------------------------------------ */
      /* Education / profession / income                              */
      /* ------------------------------------------------------------ */

      educationPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        }
      ],

      occupationPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        }
      ],

      incomePreferences: {
        min: {
          type:
            Number,

          min:
            0
        },

        max: {
          type:
            Number,

          min:
            0
        }
      },

      /* ------------------------------------------------------------ */
      /* Lifestyle / family                                           */
      /* ------------------------------------------------------------ */

      dietPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        }
      ],

      familyTypePreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        }
      ],

      familyValuePreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            100
        }
      ],

      smokingPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        }
      ],

      drinkingPreferences: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            80
        }
      ],

      /* ------------------------------------------------------------ */
      /* Property / asset preferences                                 */
      /* ------------------------------------------------------------ */

      propertyPreferences: {
        ownResidence: {
          type:
            String,

          enum:
            YES_NO_ANY,

          default:
            'Any'
        },

        agricultureLand: {
          type:
            String,

          enum:
            YES_NO_ANY,

          default:
            'Any'
        },

        businessAssets: {
          type:
            String,

          enum:
            YES_NO_ANY,

          default:
            'Any'
        }
      },

      /* ------------------------------------------------------------ */
      /* Marriage timeline                                            */
      /* ------------------------------------------------------------ */

      marriageTimeline: [
        {
          type:
            String,

          trim:
            true,

          maxlength:
            160
        }
      ],

      /* ------------------------------------------------------------ */
      /* Importance / hard requirements                               */
      /* ------------------------------------------------------------ */

      /*
       * Low:
       * small scoring impact
       *
       * Medium:
       * normal scoring impact
       *
       * High:
       * strong scoring impact
       *
       * Must Have:
       * mismatch or unavailable candidate data means
       * the candidate is not eligible for recommendation.
       */
      importance:
        importanceSchema,

      /* ------------------------------------------------------------ */
      /* Free-form expectations                                       */
      /* ------------------------------------------------------------ */

      additionalPreferences: {
        type:
          String,

        trim:
          true,

        maxlength:
          1500
      }
    },

    {
      timestamps:
        true
    }
  );



schema.index({
  preferredGender:
    1
});

schema.index({
  ageMin:
    1,

  ageMax:
    1
});

schema.index({
  heightMin:
    1,

  heightMax:
    1
});

schema.index({
  weightMin:
    1,

  weightMax:
    1
});

schema.pre(
  'validate',
  function () {
    const validateRange =
      (
        min,
        max,
        label
      ) => {
        if (
          min !==
            undefined &&
          min !==
            null &&
          max !==
            undefined &&
          max !==
            null &&
          min >
            max
        ) {
          this.invalidate(
            label,
            `${label} minimum cannot exceed maximum.`
          );
        }
      };

    validateRange(
      this.ageMin,
      this.ageMax,
      'age'
    );

    validateRange(
      this.heightMin,
      this.heightMax,
      'height'
    );

    validateRange(
      this.weightMin,
      this.weightMax,
      'weight'
    );

    validateRange(
      this.incomePreferences
        ?.min,
      this.incomePreferences
        ?.max,
      'incomePreferences'
    );
  }
);

export default mongoose.model(
  'PartnerPreference',
  schema
);