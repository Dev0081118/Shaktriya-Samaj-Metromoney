import mongoose from 'mongoose';

const planConfigSchema =
  new mongoose.Schema(
    {
      plan: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'Plan',

        required:
          true,

        unique:
          true,

        index:
          true
      },

      includedCredits: {
        type:
          Number,

        default:
          0,

        min:
          0,

        max:
          1000
      },

      durationHours: {
        type:
          Number,

        default:
          12,

        min:
          1,

        max:
          168
      },

      active: {
        type:
          Boolean,

        default:
          true
      }
    },

    {
      timestamps:
        true
    }
  );

const boostPackSchema =
  new mongoose.Schema(
    {
      name: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxLength:
          100
      },

      slug: {
        type:
          String,

        required:
          true,

        unique:
          true,

        trim:
          true,

        lowercase:
          true
      },

      price: {
        type:
          Number,

        required:
          true,

        min:
          1
      },

      credits: {
        type:
          Number,

        required:
          true,

        min:
          1,

        max:
          1000
      },

      durationHours: {
        type:
          Number,

        required:
          true,

        min:
          1,

        max:
          168,

        default:
          12
      },

      active: {
        type:
          Boolean,

        default:
          true,

        index:
          true
      },

      sortOrder: {
        type:
          Number,

        default:
          0
      }
    },

    {
      timestamps:
        true
    }
  );

boostPackSchema.index({
  active:
    1,

  sortOrder:
    1,

  price:
    1
});

const creditGrantSchema =
  new mongoose.Schema(
    {
      user: {
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

      /*
       * Idempotency key.
       *
       * Examples:
       * subscription:<subscriptionId>
       * pack-order:<boostOrderId>
       * admin:<unique-id>
       */
      sourceKey: {
        type:
          String,

        required:
          true,

        unique:
          true,

        index:
          true
      },

      sourceType: {
        type:
          String,

        enum: [
          'Subscription',
          'BoostPack',
          'Admin'
        ],

        required:
          true
      },

      sourceId: {
        type:
          mongoose.Schema.Types
            .ObjectId
      },

      creditsGranted: {
        type:
          Number,

        required:
          true,

        min:
          1
      },

      creditsRemaining: {
        type:
          Number,

        required:
          true,

        min:
          0
      },

      /*
       * One consumed credit activates the profile for
       * this many hours.
       */
      durationHours: {
        type:
          Number,

        required:
          true,

        min:
          1,

        max:
          168
      },

      /*
       * Subscription credits expire with membership.
       *
       * Purchased boost-pack credits may keep this null.
       */
      expiresAt: {
        type:
          Date,

        default:
          null
      },

      status: {
        type:
          String,

        enum: [
          'Active',
          'Expired',
          'Revoked'
        ],

        default:
          'Active',

        index:
          true
      }
    },

    {
      timestamps:
        true
    }
  );

creditGrantSchema.index({
  user:
    1,

  status:
    1,

  expiresAt:
    1,

  creditsRemaining:
    1
});

const activationSchema =
  new mongoose.Schema(
    {
      user: {
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

      profile: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'MatrimonialProfile',

        required:
          true,

        index:
          true
      },

      creditGrant: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'BoostCreditGrant',

        required:
          true
      },

      sourceType: {
        type:
          String,

        enum: [
          'Subscription',
          'BoostPack',
          'Admin'
        ],

        required:
          true
      },

      durationHours: {
        type:
          Number,

        required:
          true
      },

      startsAt: {
        type:
          Date,

        required:
          true,

        index:
          true
      },

      endsAt: {
        type:
          Date,

        required:
          true,

        index:
          true
      }
    },

    {
      timestamps:
        true
    }
  );

activationSchema.index({
  profile:
    1,

  endsAt:
    -1
});

const boostOrderSchema =
  new mongoose.Schema(
    {
      user: {
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

      pack: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          'BoostPack',

        required:
          true
      },

      packNameSnapshot: {
        type:
          String,

        required:
          true
      },

      creditsSnapshot: {
        type:
          Number,

        required:
          true,

        min:
          1
      },

      durationHoursSnapshot: {
        type:
          Number,

        required:
          true,

        min:
          1
      },

      amount: {
        type:
          Number,

        required:
          true,

        min:
          1
      },

      currency: {
        type:
          String,

        default:
          'INR',

        uppercase:
          true
      },

      provider: {
        type:
          String,

        enum: [
          'razorpay',
          'mock'
        ],

        default:
          'razorpay'
      },

      providerOrderId: {
        type:
          String,

        unique:
          true,

        sparse:
          true
      },

      providerPaymentId: {
        type:
          String,

        unique:
          true,

        sparse:
          true
      },

      status: {
        type:
          String,

        enum: [
          'Created',
          'Processing',
          'Paid',
          'Failed'
        ],

        default:
          'Created',

        index:
          true
      },

      verifiedAt:
        Date,

      processedEvents: {
        type: [
          String
        ],

        default: []
      }
    },

    {
      timestamps:
        true
    }
  );

boostOrderSchema.index({
  user:
    1,

  status:
    1,

  createdAt:
    -1
});

export const BoostPlanConfig =
  mongoose.model(
    'BoostPlanConfig',
    planConfigSchema
  );

export const BoostPack =
  mongoose.model(
    'BoostPack',
    boostPackSchema
  );

export const BoostCreditGrant =
  mongoose.model(
    'BoostCreditGrant',
    creditGrantSchema
  );

export const BoostActivation =
  mongoose.model(
    'BoostActivation',
    activationSchema
  );

export const BoostOrder =
  mongoose.model(
    'BoostOrder',
    boostOrderSchema
  );