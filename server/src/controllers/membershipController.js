import {
  Plan,
  Payment,
  Subscription,
  Notification
} from '../models/Platform.js';

import { paymentService } from '../services/paymentService.js';

import {
  getUserEntitlements,
  getUsage,
  defaultFeatures
} from '../services/entitlementService.js';

import { getSystemSettings } from '../services/systemService.js';
import { emailUser } from '../services/notificationEmailService.js';
import { asyncHandler, ApiError, ok } from '../utils/http.js';

const snapshotFor = (plan) => ({
  ...defaultFeatures,
  ...(plan.features?.toObject?.() || plan.features || {})
});

/*
 * Public membership plans.
 *
 * Free plan internally entitlement fallback mate rehse,
 * pan public pricing page par fakt paid plans j show karvana.
 */
export const publicPlans = asyncHandler(async (_req, res) =>
  ok(res, {
    plans: await Plan.find({
      active: true,
      price: { $gt: 0 }
    })
      .select('name slug price durationDays features')
      .sort('price')
  })
);

/*
 * Logged-in member ni current membership details.
 */
export const subscriptionMe = asyncHandler(async (req, res) => {
  const entitlements = await getUserEntitlements(req.user.id);

  const usage = await getUsage(
    req.user.id,
    entitlements
  );

  const subscription = entitlements.subscription;

  const latestPayment = await Payment.findOne({
    user: req.user.id
  })
    .select(
      'status provider amount currency createdAt verifiedAt'
    )
    .sort('-createdAt')
    .lean();

  ok(res, {
    plan: entitlements.plan,

    status:
      subscription?.status || 'Active',

    startsAt:
      subscription?.startsAt || null,

    endsAt:
      subscription?.endsAt || null,

    daysRemaining: subscription
      ? Math.max(
          0,
          Math.ceil(
            (subscription.endsAt - Date.now()) /
              864e5
          )
        )
      : null,

    entitlements,

    usage: {
      interestsUsed:
        usage.interestsUsed || 0,

      contactViewsUsed:
        usage.contactViewsUsed || 0,

      periodStart:
        usage.periodStart,

      periodEnd:
        usage.periodEnd
    },

    latestPayment
  });
});

/*
 * Member entitlement endpoint.
 */
export const entitlements = asyncHandler(
  async (req, res) =>
    ok(res, {
      entitlements:
        await getUserEntitlements(req.user.id)
    })
);

/*
 * Create Razorpay order.
 */
export const createOrder = asyncHandler(
  async (req, res) => {
    const settings =
      await getSystemSettings();

    if (!settings.paymentsEnabled) {
      throw new ApiError(
        503,
        'Membership payments are temporarily unavailable.'
      );
    }

    const plan = await Plan.findOne({
      slug: String(
        req.body.planSlug || ''
      ),
      active: true
    });

    if (!plan) {
      throw new ApiError(
        404,
        'Membership plan not found.'
      );
    }

    if (plan.price <= 0) {
      throw new ApiError(
        400,
        'This plan does not require payment.'
      );
    }

    /*
     * MVP membership policy:
     *
     * Ek time par ek j paid membership active rehse.
     *
     * Premium active hoy tyare Assisted immediately purchase
     * nai kari shake.
     *
     * Existing membership expire thay pachi bijo plan lai shake.
     */
    const activeSubscription =
      await Subscription.findOne({
        user: req.user.id,
        status: 'Active',
        endsAt: {
          $gt: new Date()
        }
      }).populate('plan');

    if (activeSubscription) {
      const activePlanName =
        activeSubscription.planNameSnapshot ||
        activeSubscription.plan?.name ||
        'membership';

      throw new ApiError(
        409,
        `Your ${activePlanName} membership is already active. You can choose another plan after it expires.`
      );
    }

    /*
     * User checkout close kari de ane 15 minute ma
     * fari same plan select kare to same Razorpay order reuse karisu.
     *
     * Aa unnecessary duplicate Razorpay orders avoid kare che.
     */
    const recentPayment =
      await Payment.findOne({
        user: req.user.id,
        plan: plan._id,
        status: 'Created',
        provider: 'razorpay',
        createdAt: {
          $gte: new Date(
            Date.now() -
              15 * 60 * 1000
          )
        }
      }).sort('-createdAt');

    if (
      recentPayment &&
      recentPayment.providerOrderId
    ) {
      return ok(
        res,
        {
          order: {
            provider: 'razorpay',
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

/*
 * Payment successfully verify thai gaya pachi
 * membership activate kare che.
 */
export async function activatePayment(
  payment,
  providerPaymentId
) {
  /*
   * Already paid hoy to duplicate verification thi
   * subscription fari create nai thase.
   */
  if (payment.status === 'Paid') {
    return payment;
  }

  if (payment.provider === 'mock') {
    throw new ApiError(
      409,
      'Development payment orders cannot activate membership.'
    );
  }

  /*
   * Payment record ne Processing state ma lock kariye.
   *
   * Checkout verify ane webhook same time ave to
   * duplicate activation avoid thay.
   */
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

    if (current?.status === 'Paid') {
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

  /*
   * Safety guard.
   *
   * Normally createOrder active membership block kare che.
   *
   * Pan jo be checkout/tab/race condition hoy,
   * activation time par pan double-check kariye.
   */
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

  if (existingActiveSubscription) {
    locked.status =
      'Failed';

    await locked.save();

    throw new ApiError(
      409,
      'An active membership already exists for this account.'
    );
  }

  /*
   * Every successful payment creates one independent
   * subscription period.
   */
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
        snapshotFor(plan),

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

  await locked.save();

  await Notification.create({
    user:
      locked.user,

    type:
      'SUBSCRIPTION',

    title:
      'Membership activated',

    message:
      `Your ${plan.name} membership is active until ${subscription.endsAt.toLocaleDateString('en-IN')}.`,

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
 * Razorpay Checkout signature verification.
 */
export const verify = asyncHandler(
  async (req, res) => {
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

    if (
      payment.status !== 'Paid'
    ) {
      paymentService.verifyCheckout({
        orderId,
        paymentId,
        signature:
          provided
      });
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
 *
 * Production ma payment.captured,
 * payment.failed ane refund.processed handle kare che.
 */
export const razorpayWebhook =
  asyncHandler(
    async (req, res) => {
      paymentService.verifyWebhook(
        req.body,
        req.headers[
          'x-razorpay-signature'
        ]
      );

      const event =
        JSON.parse(
          req.body.toString(
            'utf8'
          )
        );

      const paymentEntity =
        event.payload
          ?.payment
          ?.entity;

      const refundEntity =
        event.payload
          ?.refund
          ?.entity;

      const eventId =
        req.headers[
          'x-razorpay-event-id'
        ] ||
        `${event.event}:${
          paymentEntity?.id ||
          refundEntity?.id
        }`;

      let payment =
        paymentEntity?.order_id
          ? await Payment.findOne({
              providerOrderId:
                paymentEntity.order_id
            })
          : refundEntity?.payment_id
            ? await Payment.findOne({
                providerPaymentId:
                  refundEntity.payment_id
              })
            : null;

      /*
       * Unknown payment hoy to webhook 200 accept kariye.
       *
       * Razorpay unnecessary retry nai kare.
       */
      if (!payment) {
        return ok(
          res,
          {},
          'Webhook accepted.'
        );
      }

      /*
       * Duplicate webhook replay protection.
       */
      if (
        payment.processedEvents.includes(
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
        payment =
          await activatePayment(
            payment,
            paymentEntity.id
          );
      }

      /*
       * Late payment.failed webhook successful payment
       * ne Failed ma convert nai kari shake.
       */
      else if (
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
        }
      }

      /*
       * Current MVP policy:
       * only full refunds cancel membership automatically.
       *
       * Razorpay refund amount paise ma hoy che.
       */
      else if (
        event.event ===
        'refund.processed'
      ) {
        const refundAmount =
          Number(
            refundEntity?.amount ||
              0
          );

        const originalAmount =
          Math.round(
            Number(
              payment.amount ||
                0
            ) * 100
          );

        const isFullRefund =
          refundAmount >=
          originalAmount;

        if (isFullRefund) {
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
      }

      payment.processedEvents.addToSet(
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