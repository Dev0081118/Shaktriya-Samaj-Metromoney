import mongoose from 'mongoose';

const notification = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    type: {
      type: String,
      enum: [
        'NEW_INTEREST',
        'INTEREST_ACCEPTED',
        'INTEREST_DECLINED',
        'NEW_MATCH',
        'PROFILE_APPROVED',
        'PROFILE_REJECTED',
        'PROFILE_VIEW',
        'SUBSCRIPTION',
        'SYSTEM'
      ]
    },

    title: String,
    message: String,

    relatedProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile'
    },

    relatedRecord: {
      type: mongoose.Schema.Types.ObjectId
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const report = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    reportedProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true
    },

    reason: {
      type: String,
      enum: [
        'Fake Profile',
        'Inappropriate Content',
        'Spam',
        'Harassment',
        'Incorrect Information',
        'Other'
      ]
    },

    description: {
      type: String,
      maxLength: 1000
    },

    status: {
      type: String,
      enum: [
        'Open',
        'Reviewed',
        'Resolved',
        'Dismissed'
      ],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

const block = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    blockedProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true
    }
  },
  {
    timestamps: true
  }
);

block.index(
  {
    user: 1,
    blockedProfile: 1
  },
  {
    unique: true
  }
);

const plan = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1
    },

    features: {
      interestLimit: {
        type: Number,
        default: 0,
        min: 0
      },

      contactViewLimit: {
        type: Number,
        default: 0,
        min: 0
      },

      messageLimit: {
        type: Number,
        default: 0,
        min: 0
      },

      advancedSearch: {
        type: Boolean,
        default: false
      },

      profileBoost: {
        type: Boolean,
        default: false
      },

      prioritySupport: {
        type: Boolean,
        default: false
      },

      relationshipManager: {
        type: Boolean,
        default: false
      }
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const subscription = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },

    planNameSnapshot: {
  type: String,
  trim: true,
  default: 'Membership'
},

priceSnapshot: {
  type: Number,
  default: 0,
  min: 0
},

    entitlementSnapshot: {
      interestLimit: {
        type: Number,
        default: 0
      },

      contactViewLimit: {
        type: Number,
        default: 0
      },

      messageLimit: {
        type: Number,
        default: 0
      },

      advancedSearch: {
        type: Boolean,
        default: false
      },

      profileBoost: {
        type: Boolean,
        default: false
      },

      prioritySupport: {
        type: Boolean,
        default: false
      },

      relationshipManager: {
        type: Boolean,
        default: false
      }
    },

    status: {
      type: String,
      enum: [
        'Active',
        'Expired',
        'Cancelled'
      ],
      default: 'Active',
      index: true
    },

    startsAt: {
      type: Date,
      required: true
    },

    endsAt: {
      type: Date,
      required: true
    },

    expiryRemindersSent: [
      Number
    ]
  },
  {
    timestamps: true
  }
);

/*
 * Hard guarantee:
 * one Active membership per user.
 *
 * Historical Expired/Cancelled subscriptions remain allowed.
 */
subscription.index(
  {
    user: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: 'Active'
    }
  }
);

subscription.index({
  user: 1,
  status: 1,
  endsAt: -1
});

const payment = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },

    provider: {
      type: String,
      enum: [
        'razorpay',
        'mock'
      ],
      default: 'mock'
    },

    providerOrderId: {
      type: String,
      trim: true,
      index: true
    },

    providerPaymentId: {
      type: String,
      trim: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        'Created',
        'Processing',
        'Paid',
        'Failed',
        'Refunded'
      ],
      default: 'Created'
    },

    verifiedAt: Date,

    /*
     * Razorpay refund amounts are reported in paise.
     * Keeping cumulative amount in paise avoids
     * floating-point currency errors.
     */
    refundedAmountPaise: {
      type: Number,
      default: 0,
      min: 0
    },

    processedEvents: {
      type: [
        String
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

payment.index({
  user: 1,
  status: 1,
  createdAt: -1
});

export const Notification =
  mongoose.model(
    'Notification',
    notification
  );

export const Report =
  mongoose.model(
    'Report',
    report
  );

export const Block =
  mongoose.model(
    'Block',
    block
  );

export const Plan =
  mongoose.model(
    'Plan',
    plan
  );

export const Subscription =
  mongoose.model(
    'Subscription',
    subscription
  );

export const Payment =
  mongoose.model(
    'Payment',
    payment
  );