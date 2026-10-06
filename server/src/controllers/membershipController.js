import {
  Plan,
  Payment,
  Subscription,
  Notification
} from '../models/Platform.js';

import {
  paymentService
} from '../services/paymentService.js';

import {
  getUserEntitlements,
  getUsage,
  defaultFeatures
} from '../services/entitlementService.js';

import {
  getSystemSettings
} from '../services/systemService.js';

import {
  emailUser
} from '../services/notificationEmailService.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

const snapshotFor = (
  plan
) => ({
  ...defaultFeatures,

  ...(
    plan.features
      ?.toObject?.() ||
    plan.features ||
    {}
  )
});

const amountInPaise = (
  amount
) =>
  Math.round(
    Number(
      amount ||
        0
    ) * 100
  );

const validateCapturedPayment =
  (
    payment,
    entity
  ) => {
    if (!entity) {
      throw new ApiError(
        400,
        'Payment webhook payload is incomplete.'
      );
    }

    if (
      String(
        entity.order_id ||
          ''
      ) !==
      String(
        payment.providerOrderId ||
          ''
      )
    ) {
      throw new ApiError(
        400,
        'Webhook payment order does not match.'
      );
    }

    if (
      Number(
        entity.amount
      ) !==
      amountInPaise(
        payment.amount
      )
    ) {
      throw new ApiError(
        409,
        'Webhook payment amount does not match the order.'
      );
    }

    const currency =
      String(
        entity.currency ||
          ''
      ).toUpperCase();

    if (
      currency &&
      currency !==
        String(
          payment.currency ||
            'INR'
        ).toUpperCase()
    ) {
      throw new ApiError(
        409,
        'Webhook payment currency does not match the order.'
      );
    }
  };

/*
 * Public pricing:
 * Free stays internal fallback.
 */
export const publicPlans =
  asyncHandler(
    async (
      _req,
      res
    ) =>
      ok(
        res,
        {
          plans:
            await Plan.find({
              active:
                true,

              price: {
                $gt:
                  0
              }
            })
              .select(
                'name slug price durationDays features'
              )
              .sort(
                'price'
              )
        }
      )
  );

/*
 * Logged-in member membership.
 */
export const subscriptionMe =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const entitlements =
        await getUserEntitlements(
          req.user.id
        );

      const usage =
        await getUsage(
          req.user.id,
          entitlements
        );

      const subscription =
        entitlements.subscription;

      const latestPayment =
        await Payment.findOne({
          user:
            req.user.id
        })
          .select(
            'status provider amount currency createdAt verifiedAt'
          )
          .sort(
            '-createdAt'
          )
          .lean();

      ok(
        res,
        {
          plan:
            entitlements.plan,

          status:
            subscription
              ?.status ||
            'Active',

          startsAt:
            subscription
              ?.startsAt ||
            null,

          endsAt:
            subscription
              ?.endsAt ||
            null,

          daysRemaining:
            subscription
              ? Math.max(
                  0,
                  Math.ceil(
                    (
                      subscription.endsAt -
                      Date.now()
                    ) /
                      864e5
                  )
                )
              : null,

          entitlements,

          usage: {
            interestsUsed:
              usage.interestsUsed ||
              0,

            contactViewsUsed:
              usage.contactViewsUsed ||
              0,

            periodStart:
              usage.periodStart,

            periodEnd:
              usage.periodEnd
          },

          latestPayment
        }
      );
    }
  );

export const entitlements =
  asyncHandler(
    async (
      req,
      res
    ) =>
      ok(
        res,
        {
          entitlements:
            await getUserEntitlements(
              req.user.id
            )
        }
      )
  );

/*
 * Create Razorpay order.
 */
export const createOrder =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const settings =
        await getSystemSettings();

      if (
        !settings.paymentsEnabled
      ) {
        throw new ApiError(
          503,
          'Membership payments are temporarily unavailable.'
        );
      }

      const plan =
        await Plan.findOne({
          slug:
            String(
              req.body.planSlug ||
                ''
            )
              .trim()
              .toLowerCase(),

          active:
            true
        });

      if (!plan) {
        throw new ApiError(
          404,
          'Membership plan not found.'
        );
      }

      if (
        !Number.isFinite(
          Number(
            plan.price
          )
        ) ||
        plan.price <= 0
      ) {
        throw new ApiError(
          400,
          'This plan does not require payment.'
        );
      }

      const activeSubscription =
        await Subscription.findOne({
          user:
            req.user.id,

          status:
            'Active',

          endsAt: {
            $gt:
              new Date()
          }
        }).populate(
          'plan'
        );

      if (
        activeSubscription
      ) {
        const activePlanName =
          activeSubscription
            .planNameSnapshot ||
          activeSubscription
            .plan?.name ||
          'membership';

        throw new ApiError(
          409,
          `Your ${activePlanName} membership is already active. You can choose another plan after it expires.`
        );
      }

      const recentPayment =
        await Payment.findOne({
          user:
            req.user.id,

          plan:
            plan._id,

          status:
            'Created',

          provider:
            'razorpay',

          createdAt: {
            $gte:
              new Date(
                Date.now() -
                  15 *
                    60 *
                    1000
              )
          }
        }).sort(
          '-createdAt'
        );

      if (
        recentPayment &&
        recentPayment.providerOrderId
      ) {
        return ok(
          res,
          {
            order: {
              provider:
                'razorpay',

              providerOrderId:
                recentPayment.providerOrderId,

              amount:
                recentPayment.amount,

              currency:
                recentPayment.currency,

              keyId:
                process.env.RAZORPAY_KEY_ID,

              name:
                plan.name
            },

            payment:
              recentPayment
          },
          'Existing payment order reused.'
        );
      }

      const receipt =
        `ksm_${req.user.id}_${Date.now()}`;

      const order =
        await paymentService.createOrder({
          amount:
            plan.price,

          user:
            req.user.id,

          receipt
        });

      const payment =
        await Payment.create({
          user:
            req.user.id,

          plan:
            plan._id,

          provider:
            order.provider,

          providerOrderId:
            order.providerOrderId,

          amount:
            order.amount,

          currency:
            order.currency,

          status:
            'Created'
        });

      ok(
        res,
        {
          order: {
            ...order,

            name:
              plan.name
          },

          payment
        },
        'Payment order created.',
        201
      );
    }
  );

export async function activatePayment(
  payment,
  providerPaymentId
) {
  if (
    payment.status ===
    'Paid'
  ) {
    return payment;
  }

  if (
    payment.provider ===
    'mock'
  ) {
    throw new ApiError(
      409,
      'Development payment orders cannot activate membership.'
    );
  }

  const locked =
    await Payment.findOneAndUpdate(
      {
        _id:
          payment._id,

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
            payment.providerPaymentId
        }
      },

      {
        returnDocument:
          'after'
      }
    );

  if (!locked) {
    const current =
      await Payment.findById(
        payment._id
      );

    if (
      current?.status ===
      'Paid'
    ) {
      return current;
    }

    throw new ApiError(
      409,
      'Payment activation is already being processed.'
    );
  }

  const plan =
    await Plan.findById(
      locked.plan
    );

  if (!plan) {
    locked.status =
      'Failed';

    await locked.save();

    throw new ApiError(
      409,
      'The purchased plan no longer exists.'
    );
  }

  const now =
    new Date();

  const existingActiveSubscription =
    await Subscription.findOne({
      user:
        locked.user,

      status:
        'Active',

      endsAt: {
        $gt:
          now
      }
    });

  if (
    existingActiveSubscription
  ) {
    locked.status =
      'Failed';

    await locked.save();

    throw new ApiError(
      409,
      'An active membership already exists for this account.'
    );
  }

  const subscription =
    await Subscription.create({
      user:
        locked.user,

      plan:
        plan._id,

      planNameSnapshot:
        plan.name,

      priceSnapshot:
        plan.price,

      entitlementSnapshot:
        snapshotFor(
          plan
        ),

      status:
        'Active',

      startsAt:
        now,

      endsAt:
        new Date(
          now.getTime() +
            plan.durationDays *
              864e5
        )
    });

  locked.status =
    'Paid';

  locked.verifiedAt =
    new Date();

  locked.subscription =
    subscription._id;

  if (
    providerPaymentId
  ) {
    locked.providerPaymentId =
      providerPaymentId;
  }

  await locked.save();

  await Notification.create({
    user:
      locked.user,

    type:
      'SUBSCRIPTION',

    title:
      'Membership activated',

    message:
      `Your ${plan.name} membership is active until ${subscription.endsAt.toLocaleDateString(
        'en-IN'
      )}.`,

    relatedRecord:
      subscription._id
  });

  await emailUser(
    locked.user,
    {
      category:
        'payment',

      subject:
        `${plan.name} membership activated`,

      template:
        'subscription-activated',

      data: {
        plan:
          plan.name,

        amount:
          `INR ${locked.amount}`,

        endsAt:
          subscription.endsAt.toISOString()
      }
    }
  );

  return locked;
}

/*
 * Razorpay Checkout verification.
 *
 * Signature is ALWAYS checked, even if a previous
 * webhook has already marked the order Paid.
 */
export const verify =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        razorpay_order_id:
          orderId,

        razorpay_payment_id:
          paymentId,

        razorpay_signature:
          provided
      } = req.body;

      if (
        !orderId ||
        !paymentId ||
        !provided
      ) {
        throw new ApiError(
          400,
          'Complete payment verification details are required.'
        );
      }

      const payment =
        await Payment.findOne({
          providerOrderId:
            orderId,

          user:
            req.user.id
        });

      if (!payment) {
        throw new ApiError(
          404,
          'Payment order not found.'
        );
      }

      paymentService.verifyCheckout({
        orderId,
        paymentId,
        signature:
          provided
      });

      if (
        payment.providerPaymentId &&
        payment.providerPaymentId !==
          paymentId
      ) {
        throw new ApiError(
          409,
          'Payment identifier does not match the verified order.'
        );
      }

      await activatePayment(
        payment,
        paymentId
      );

      const entitlements =
        await getUserEntitlements(
          req.user.id
        );

      ok(
        res,
        {
          payment:
            await Payment.findById(
              payment._id
            ),

          entitlements
        },
        'Payment verified and membership activated.'
      );
    }
  );

/*
 * Razorpay webhook.
 */
export const razorpayWebhook =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const signature =
        req.headers[
          'x-razorpay-signature'
        ];

      if (
        !signature
      ) {
        throw new ApiError(
          400,
          'Webhook signature is required.'
        );
      }

      paymentService.verifyWebhook(
        req.body,
        signature
      );

      let event;

      try {
        event =
          JSON.parse(
            req.body.toString(
              'utf8'
            )
          );
      } catch {
        throw new ApiError(
          400,
          'Webhook payload is invalid.'
        );
      }

      const paymentEntity =
        event.payload
          ?.payment
          ?.entity;

      const refundEntity =
        event.payload
          ?.refund
          ?.entity;

      const entityId =
        paymentEntity?.id ||
        refundEntity?.id ||
        'unknown';

      const eventId =
        String(
          req.headers[
            'x-razorpay-event-id'
          ] ||
            `${event.event}:${entityId}`
        );

      let payment =
        paymentEntity
          ?.order_id
          ? await Payment.findOne({
              providerOrderId:
                paymentEntity.order_id
            })
          : refundEntity
              ?.payment_id
            ? await Payment.findOne({
                providerPaymentId:
                  refundEntity.payment_id
              })
            : null;

      /*
       * Unknown external transaction:
       * acknowledge safely so Razorpay does not retry.
       */
      if (!payment) {
        return ok(
          res,
          {},
          'Webhook accepted.'
        );
      }

      if (
        payment.processedEvents
          .includes(
            eventId
          )
      ) {
        return ok(
          res,
          {},
          'Webhook already processed.'
        );
      }

      if (
        event.event ===
        'payment.captured'
      ) {
        validateCapturedPayment(
          payment,
          paymentEntity
        );

        if (
          payment.providerPaymentId &&
          payment.providerPaymentId !==
            paymentEntity.id
        ) {
          throw new ApiError(
            409,
            'Captured payment identifier does not match the stored payment.'
          );
        }

        payment =
          await activatePayment(
            payment,
            paymentEntity.id
          );
      } else if (
        event.event ===
        'payment.failed'
      ) {
        if (
          ![
            'Paid',
            'Refunded'
          ].includes(
            payment.status
          )
        ) {
          payment.status =
            'Failed';

          if (
            paymentEntity?.id
          ) {
            payment.providerPaymentId =
              paymentEntity.id;
          }
        }
      } else if (
        event.event ===
        'refund.processed'
      ) {
        const refundAmount =
          Number(
            refundEntity
              ?.amount ||
              0
          );

        const originalAmount =
          amountInPaise(
            payment.amount
          );

        const isFullRefund =
          refundAmount >=
          originalAmount;

        if (
          isFullRefund
        ) {
          payment.status =
            'Refunded';

          if (
            payment.subscription
          ) {
            await Subscription.updateOne(
              {
                _id:
                  payment.subscription,

                status:
                  'Active'
              },

              {
                $set: {
                  status:
                    'Cancelled',

                  endsAt:
                    new Date()
                }
              }
            );
          }
        }
      } else {
        return ok(
          res,
          {},
          'Webhook event ignored.'
        );
      }

      payment.processedEvents
        .addToSet(
          eventId
        );

      await payment.save();

      ok(
        res,
        {},
        'Webhook processed.'
      );
    }
  );