import MatrimonialProfile from '../models/MatrimonialProfile.js';

import {
  Subscription
} from '../models/Platform.js';

import {
  BoostActivation,
  BoostCreditGrant,
  BoostOrder,
  BoostPlanConfig
} from '../models/Boost.js';

import {
  ApiError
} from '../utils/http.js';

const amountInPaise =
  (
    amount
  ) =>
    Math.round(
      Number(
        amount ||
          0
      ) *
        100
    );

const expireOldCredits =
  async (
    userId
  ) => {
    const now =
      new Date();

    await BoostCreditGrant.updateMany(
      {
        user:
          userId,

        status:
          'Active',

        expiresAt: {
          $ne:
            null,

          $lte:
            now
        }
      },

      {
        $set: {
          status:
            'Expired'
        }
      }
    );
  };

export const grantSubscriptionBoosts =
  async ({
    userId,
    subscription,
    plan
  }) => {
    if (
      !subscription ||
      !plan
    ) {
      return null;
    }

    const config =
      await BoostPlanConfig.findOne({
        plan:
          plan._id,

        active:
          true
      });

    if (
      !config ||
      Number(
        config.includedCredits ||
          0
      ) <=
        0
    ) {
      return null;
    }

    const sourceKey =
      `subscription:${subscription._id}`;

    return BoostCreditGrant.findOneAndUpdate(
      {
        sourceKey
      },

      {
        $setOnInsert: {
          user:
            userId,

          sourceKey,

          sourceType:
            'Subscription',

          sourceId:
            subscription._id,

          creditsGranted:
            config.includedCredits,

          creditsRemaining:
            config.includedCredits,

          durationHours:
            config.durationHours,

          expiresAt:
            subscription.endsAt,

          status:
            'Active'
        }
      },

      {
        upsert:
          true,

        returnDocument:
          'after',

        setDefaultsOnInsert:
          true
      }
    );
  };

export const syncSubscriptionBoostGrant =
  async (
    userId
  ) => {
    const now =
      new Date();

    await expireOldCredits(
      userId
    );

    const subscription =
      await Subscription.findOne({
        user:
          userId,

        status:
          'Active',

        endsAt: {
          $gt:
            now
        }
      }).populate(
        'plan'
      );

    if (
      !subscription ||
      !subscription.plan
    ) {
      return null;
    }

    return grantSubscriptionBoosts({
      userId,
      subscription,
      plan:
        subscription.plan
    });
  };

const ensurePackGrant =
  async (
    order
  ) => {
    if (
      !order ||
      order.status !==
        'Paid'
    ) {
      return null;
    }

    const sourceKey =
      `pack-order:${order._id}`;

    return BoostCreditGrant.findOneAndUpdate(
      {
        sourceKey
      },

      {
        $setOnInsert: {
          user:
            order.user,

          sourceKey,

          sourceType:
            'BoostPack',

          sourceId:
            order._id,

          creditsGranted:
            order.creditsSnapshot,

          creditsRemaining:
            order.creditsSnapshot,

          durationHours:
            order
              .durationHoursSnapshot,

          expiresAt:
            null,

          status:
            'Active'
        }
      },

      {
        upsert:
          true,

        returnDocument:
          'after',

        setDefaultsOnInsert:
          true
      }
    );
  };

const syncPaidPackOrders =
  async (
    userId
  ) => {
    const orders =
      await BoostOrder.find({
        user:
          userId,

        status:
          'Paid'
      });

    await Promise.all(
      orders.map(
        (
          order
        ) =>
          ensurePackGrant(
            order
          )
      )
    );
  };

export const getBoostWallet =
  async (
    userId
  ) => {
    await Promise.all([
      syncSubscriptionBoostGrant(
        userId
      ),

      syncPaidPackOrders(
        userId
      )
    ]);

    await expireOldCredits(
      userId
    );

    const now =
      new Date();

    const [
      profile,
      grants,
      recentActivations
    ] =
      await Promise.all([
        MatrimonialProfile.findOne({
          userId
        }).select(
          '_id profileId boostedUntil lastBoostAt'
        ),

        BoostCreditGrant.find({
          user:
            userId,

          status:
            'Active',

          creditsRemaining: {
            $gt:
              0
          },

          $or: [
            {
              expiresAt:
                null
            },

            {
              expiresAt: {
                $gt:
                  now
              }
            }
          ]
        })
          .sort({
            expiresAt:
              1,

            createdAt:
              1
          })
          .lean(),

        BoostActivation.find({
          user:
            userId
        })
          .sort({
            startsAt:
              -1
          })
          .limit(
            10
          )
          .lean()
      ]);

    const availableCredits =
      grants.reduce(
        (
          total,
          grant
        ) =>
          total +
          Number(
            grant
              .creditsRemaining ||
              0
          ),
        0
      );

    const active =
      Boolean(
        profile
          ?.boostedUntil &&
        new Date(
          profile.boostedUntil
        ) >
          now
      );

    const activeUntil =
      active
        ? profile.boostedUntil
        : null;

    return {
      profileId:
        profile?.profileId ||
        null,

      availableCredits,

      active,

      activeUntil,

      remainingSeconds:
        active
          ? Math.max(
              0,

              Math.ceil(
                (
                  new Date(
                    activeUntil
                  ).getTime() -
                  now.getTime()
                ) /
                  1000
              )
            )
          : 0,

      lastBoostAt:
        profile?.lastBoostAt ||
        null,

      grants:
        grants.map(
          (
            grant
          ) => ({
            id:
              grant._id,

            sourceType:
              grant.sourceType,

            creditsGranted:
              grant
                .creditsGranted,

            creditsRemaining:
              grant
                .creditsRemaining,

            durationHours:
              grant
                .durationHours,

            expiresAt:
              grant.expiresAt
          })
        ),

      recentActivations
    };
  };

const consumeCredit =
  async (
    userId
  ) => {
    const now =
      new Date();

    /*
     * Use expiring subscription credits first.
     */
    let grant =
      await BoostCreditGrant.findOneAndUpdate(
        {
          user:
            userId,

          status:
            'Active',

          creditsRemaining: {
            $gt:
              0
          },

          expiresAt: {
            $gt:
              now
          }
        },

        {
          $inc: {
            creditsRemaining:
              -1
          }
        },

        {
          sort: {
            expiresAt:
              1,

            createdAt:
              1
          },

          returnDocument:
            'after'
        }
      );

    /*
     * Then consume non-expiring purchased credits.
     */
    if (!grant) {
      grant =
        await BoostCreditGrant.findOneAndUpdate(
          {
            user:
              userId,

            status:
              'Active',

            creditsRemaining: {
              $gt:
                0
            },

            $or: [
              {
                expiresAt:
                  null
              },

              {
                expiresAt: {
                  $exists:
                    false
                }
              }
            ]
          },

          {
            $inc: {
              creditsRemaining:
                -1
            }
          },

          {
            sort: {
              createdAt:
                1
            },

            returnDocument:
              'after'
          }
        );
    }

    return grant;
  };

const restoreCredit =
  async (
    grantId
  ) => {
    if (!grantId) {
      return;
    }

    await BoostCreditGrant.updateOne(
      {
        _id:
          grantId
      },

      {
        $inc: {
          creditsRemaining:
            1
        }
      }
    );
  };

export const activateProfileBoost =
  async (
    userId
  ) => {
    await Promise.all([
      syncSubscriptionBoostGrant(
        userId
      ),

      syncPaidPackOrders(
        userId
      )
    ]);

    const profile =
      await MatrimonialProfile.findOne({
        userId
      });

    if (!profile) {
      throw new ApiError(
        404,
        'Create your matrimonial profile first.'
      );
    }

    const now =
      new Date();

    if (
      profile.boostedUntil &&
      new Date(
        profile.boostedUntil
      ) >
        now
    ) {
      throw new ApiError(
        409,
        'Your profile boost is already active.'
      );
    }

    const grant =
      await consumeCredit(
        userId
      );

    if (!grant) {
      throw new ApiError(
        402,
        'You do not have any boost credits available.'
      );
    }

    const durationHours =
      Number(
        grant.durationHours
      );

    const endsAt =
      new Date(
        now.getTime() +
          durationHours *
            60 *
            60 *
            1000
      );

    /*
     * Atomic profile lock.
     *
     * IMPORTANT:
     * A boost activation is NOT an organic profile edit.
     *
     * `timestamps: false` prevents Mongoose from changing
     * profile.updatedAt when the boost begins.
     *
     * This means once the boost expires, Discover can sort
     * the profile exactly according to its normal organic
     * profile state again.
     */
    const lockedProfile =
      await MatrimonialProfile.findOneAndUpdate(
        {
          _id:
            profile._id,

          $or: [
            {
              boostedUntil: {
                $exists:
                  false
              }
            },

            {
              boostedUntil:
                null
            },

            {
              boostedUntil: {
                $lte:
                  now
              }
            }
          ]
        },

        {
          $set: {
            boostedUntil:
              endsAt,

            lastBoostAt:
              now
          }
        },

        {
          returnDocument:
            'after',

          timestamps:
            false
        }
      );

    if (!lockedProfile) {
      await restoreCredit(
        grant._id
      );

      throw new ApiError(
        409,
        'Your profile boost is already active.'
      );
    }

    try {
      const activation =
        await BoostActivation.create({
          user:
            userId,

          profile:
            profile._id,

          creditGrant:
            grant._id,

          sourceType:
            grant.sourceType,

          durationHours,

          startsAt:
            now,

          endsAt
        });

      return {
        activation,

        profile:
          lockedProfile
      };
    } catch (error) {
      /*
       * Rollback must also avoid touching updatedAt.
       */
      await Promise.all([
        restoreCredit(
          grant._id
        ),

        MatrimonialProfile.updateOne(
          {
            _id:
              profile._id,

            boostedUntil:
              endsAt
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
        )
      ]);

      throw error;
    }
  };

const validateBoostPayment =
  (
    order,
    entity
  ) => {
    if (!entity) {
      throw new ApiError(
        400,
        'Boost payment details are incomplete.'
      );
    }

    if (
      String(
        entity.order_id ||
          ''
      ) !==
      String(
        order.providerOrderId ||
          ''
      )
    ) {
      throw new ApiError(
        409,
        'Boost payment order does not match.'
      );
    }

    if (
      Number(
        entity.amount
      ) !==
      amountInPaise(
        order.amount
      )
    ) {
      throw new ApiError(
        409,
        'Boost payment amount does not match.'
      );
    }

    if (
      entity.currency &&
      String(
        entity.currency
      ).toUpperCase() !==
        String(
          order.currency ||
            'INR'
        ).toUpperCase()
    ) {
      throw new ApiError(
        409,
        'Boost payment currency does not match.'
      );
    }
  };

export const activateBoostOrder =
  async (
    order,
    providerPaymentId
  ) => {
    if (
      order.status ===
        'Paid'
    ) {
      await ensurePackGrant(
        order
      );

      return order;
    }

    if (
      order.provider ===
        'mock'
    ) {
      throw new ApiError(
        409,
        'Development payment orders cannot add boost credits.'
      );
    }

    const locked =
      await BoostOrder.findOneAndUpdate(
        {
          _id:
            order._id,

          status: {
            $in: [
              'Created',
              'Failed'
            ]
          }
        },

        {
          $set: {
            status:
              'Processing',

            providerPaymentId:
              providerPaymentId ||
              order
                .providerPaymentId
          }
        },

        {
          returnDocument:
            'after'
        }
      );

    if (!locked) {
      const current =
        await BoostOrder.findById(
          order._id
        );

      if (
        current?.status ===
          'Paid'
      ) {
        await ensurePackGrant(
          current
        );

        return current;
      }

      throw new ApiError(
        409,
        'Boost payment activation is already being processed.'
      );
    }

    locked.status =
      'Paid';

    locked.verifiedAt =
      new Date();

    if (
      providerPaymentId
    ) {
      locked.providerPaymentId =
        providerPaymentId;
    }

    await locked.save();

    await ensurePackGrant(
      locked
    );

    return locked;
  };

export const processBoostWebhookEvent =
  async (
    event,
    eventId
  ) => {
    const paymentEntity =
      event.payload
        ?.payment
        ?.entity;

    if (
      !paymentEntity
        ?.order_id
    ) {
      return false;
    }

    let order =
      await BoostOrder.findOne({
        providerOrderId:
          paymentEntity.order_id
      });

    if (!order) {
      return false;
    }

    if (
      order.processedEvents.includes(
        eventId
      )
    ) {
      return true;
    }

    if (
      event.event ===
        'payment.captured'
    ) {
      validateBoostPayment(
        order,
        paymentEntity
      );

      if (
        paymentEntity.status !==
          'captured'
      ) {
        throw new ApiError(
          409,
          'Boost payment has not been captured.'
        );
      }

      order =
        await activateBoostOrder(
          order,
          paymentEntity.id
        );
    } else if (
      event.event ===
        'payment.failed'
    ) {
      if (
        order.status !==
        'Paid'
      ) {
        order.status =
          'Failed';

        if (
          paymentEntity.id
        ) {
          order.providerPaymentId =
            paymentEntity.id;
        }

        await order.save();
      }
    } else {
      return false;
    }

    order.processedEvents.addToSet(
      eventId
    );

    await order.save();

    return true;
  };

export {
  ensurePackGrant,
  validateBoostPayment
};