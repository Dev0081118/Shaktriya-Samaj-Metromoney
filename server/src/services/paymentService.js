import crypto from 'node:crypto';

import {
  ApiError
} from '../utils/http.js';

const signature = (
  value,
  secret
) =>
  crypto
    .createHmac(
      'sha256',
      secret
    )
    .update(
      value
    )
    .digest(
      'hex'
    );

const safeEqual = (
  a,
  b
) => {
  const left =
    Buffer.from(
      String(
        a ||
          ''
      )
    );

  const right =
    Buffer.from(
      String(
        b ||
          ''
      )
    );

  return (
    left.length ===
      right.length &&
    crypto.timingSafeEqual(
      left,
      right
    )
  );
};

const razorpayAuth = () => {
  const keyId =
    String(
      process.env
        .RAZORPAY_KEY_ID ||
        ''
    );

  const secret =
    String(
      process.env
        .RAZORPAY_KEY_SECRET ||
        ''
    );

  if (
    !keyId ||
    !secret
  ) {
    throw new ApiError(
      503,
      'Payment provider is not configured.'
    );
  }

  return Buffer.from(
    `${keyId}:${secret}`
  ).toString(
    'base64'
  );
};

export const paymentService = {
  async createOrder({
    amount,
    user,
    receipt
  }) {
    if (
      process.env
        .RAZORPAY_KEY_ID &&
      process.env
        .RAZORPAY_KEY_SECRET
    ) {
      const auth =
        razorpayAuth();

      let response;

      try {
        response =
          await fetch(
            'https://api.razorpay.com/v1/orders',
            {
              method:
                'POST',

              headers: {
                Authorization:
                  `Basic ${auth}`,

                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  amount:
                    Math.round(
                      Number(
                        amount
                      ) *
                        100
                    ),

                  currency:
                    'INR',

                  receipt,

                  notes: {
                    user:
                      String(
                        user
                      )
                  }
                }),

              signal:
                AbortSignal.timeout(
                  10000
                )
            }
          );
      } catch {
        throw new ApiError(
          502,
          'Payment provider is temporarily unavailable.'
        );
      }

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok ||
        !data.id
      ) {
        throw new ApiError(
          502,
          'Unable to create a secure payment order.'
        );
      }

      return {
        provider:
          'razorpay',

        providerOrderId:
          data.id,

        amount,

        currency:
          data.currency ||
          'INR',

        keyId:
          process.env
            .RAZORPAY_KEY_ID
      };
    }

    if (
      process.env
        .NODE_ENV ===
      'production'
    ) {
      throw new ApiError(
        503,
        'Payment provider is not configured.'
      );
    }

    return {
      provider:
        'mock',

      providerOrderId:
        `dev_${Date.now()}_${user}`,

      amount,

      currency:
        'INR',

      status:
        'Created',

      notice:
        'Development order only; it never activates membership.'
    };
  },

  verifyCheckout({
    orderId,
    paymentId,
    signature:
      provided
  }) {
    if (
      !process.env
        .RAZORPAY_KEY_SECRET
    ) {
      throw new ApiError(
        503,
        'Payment verification is not configured.'
      );
    }

    if (
      !safeEqual(
        signature(
          `${orderId}|${paymentId}`,
          process.env
            .RAZORPAY_KEY_SECRET
        ),
        provided
      )
    ) {
      throw new ApiError(
        400,
        'Payment signature is invalid.'
      );
    }

    return true;
  },

  async fetchPayment(
    paymentId
  ) {
    if (!paymentId) {
      throw new ApiError(
        400,
        'Payment identifier is required.'
      );
    }

    const auth =
      razorpayAuth();

    let response;

    try {
      response =
        await fetch(
          `https://api.razorpay.com/v1/payments/${encodeURIComponent(
            paymentId
          )}`,
          {
            method:
              'GET',

            headers: {
              Authorization:
                `Basic ${auth}`
            },

            signal:
              AbortSignal.timeout(
                10000
              )
          }
        );
    } catch {
      throw new ApiError(
        502,
        'Unable to confirm payment with the payment provider.'
      );
    }

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok ||
      !data.id
    ) {
      throw new ApiError(
        502,
        'Unable to confirm payment with the payment provider.'
      );
    }

    return data;
  },
  async createRefund({
  paymentId,
  amountPaise,
  refundRequestId,
  reason,
  requestedBy
}) {
  if (
    !paymentId ||
    !Number.isInteger(
      amountPaise
    ) ||
    amountPaise <= 0
  ) {
    throw new ApiError(
      400,
      'A valid refund amount is required.'
    );
  }

  const auth =
    razorpayAuth();

  let response;

  try {
    response =
      await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          paymentId
        )}/refund`,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Basic ${auth}`,

            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              amount:
                amountPaise,

              receipt:
                `rf_${refundRequestId}`.slice(
                  0,
                  40
                ),

              notes: {
                refundRequestId:
                  String(
                    refundRequestId
                  ),

                requestedBy:
                  String(
                    requestedBy
                  ),

                reason:
                  String(
                    reason
                  ).slice(
                    0,
                    200
                  )
              }
            }),

          signal:
            AbortSignal.timeout(
              10000
            )
        }
      );
  } catch {
    throw new ApiError(
      502,
      'Unable to submit refund to the payment provider.'
    );
  }

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok ||
    !data?.id
  ) {
    console.error(
      'Razorpay refund rejected:',
      {
        status:
          response.status,

        code:
          data?.error?.code ||
          'unknown'
      }
    );

    throw new ApiError(
      502,
      data?.error?.description ||
        'Payment provider rejected the refund request.'
    );
  }

  return {
    provider:
      'razorpay',

    providerRefundId:
      data.id,

    paymentId:
      data.payment_id ||
      paymentId,

    amountPaise:
      Number(
        data.amount ||
          amountPaise
      ),

    status:
      data.status ||
      'submitted'
  };
},
  verifyWebhook(
    rawBody,
    provided
  ) {
    if (
      !process.env
        .RAZORPAY_WEBHOOK_SECRET
    ) {
      throw new ApiError(
        503,
        'Payment webhook is not configured.'
      );
    }

    if (
      !safeEqual(
        signature(
          rawBody,
          process.env
            .RAZORPAY_WEBHOOK_SECRET
        ),
        provided
      )
    ) {
      throw new ApiError(
        400,
        'Webhook signature is invalid.'
      );
    }

    return true;
  }
};