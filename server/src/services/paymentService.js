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

const razorpayAuth =
  () => {
    const keyId =
      String(
        process.env
          .RAZORPAY_KEY_ID ||
          ''
      ).trim();

    const secret =
      String(
        process.env
          .RAZORPAY_KEY_SECRET ||
          ''
      ).trim();

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

const providerRequest =
  async (
    url,
    options = {},
    message =
      'Payment provider is temporarily unavailable.'
  ) => {
    const auth =
      razorpayAuth();

    let response;

    try {
      response =
        await fetch(
          url,
          {
            ...options,

            headers: {
              Authorization:
                `Basic ${auth}`,

              ...(options.body
                ? {
                    'Content-Type':
                      'application/json'
                  }
                : {}),

              ...options.headers
            },

            signal:
              AbortSignal.timeout(
                10000
              )
          }
        );
    } catch (
      error
    ) {
      throw new ApiError(
        502,
        message,
        [],
        undefined,
        {
          cause:
            error
        }
      );
    }

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    return {
      response,
      data
    };
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
      const {
        response,
        data
      } =
        await providerRequest(
          'https://api.razorpay.com/v1/orders',
          {
            method:
              'POST',

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
              })
          },
          'Payment provider is temporarily unavailable.'
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

    const {
      response,
      data
    } =
      await providerRequest(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          paymentId
        )}`,
        {
          method:
            'GET'
        },
        'Unable to confirm payment with the payment provider.'
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
      amountPaise <=
        0
    ) {
      throw new ApiError(
        400,
        'A valid refund amount is required.'
      );
    }

    const {
      response,
      data
    } =
      await providerRequest(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          paymentId
        )}/refund`,
        {
          method:
            'POST',

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
            })
        },
        'Unable to submit refund to the payment provider.'
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
            data?.error
              ?.code ||
            'unknown'
        }
      );

      throw new ApiError(
        502,
        data?.error
          ?.description ||
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

      currency:
        data.currency ||
        'INR',

      status:
        String(
          data.status ||
            'pending'
        ).toLowerCase(),

      raw:
        data
    };
  },

  /*
   * Fetch a refund directly from Razorpay.
   *
   * This is the fallback when the webhook is delayed,
   * unavailable locally, or was missed.
   */
  async fetchRefund(
    refundId
  ) {
    if (
      !refundId
    ) {
      throw new ApiError(
        400,
        'Refund identifier is required.'
      );
    }

    const {
      response,
      data
    } =
      await providerRequest(
        `https://api.razorpay.com/v1/refunds/${encodeURIComponent(
          refundId
        )}`,
        {
          method:
            'GET'
        },
        'Unable to fetch refund status from the payment provider.'
      );

    if (
      !response.ok ||
      !data?.id
    ) {
      throw new ApiError(
        502,
        data?.error
          ?.description ||
          'Unable to fetch refund status from the payment provider.'
      );
    }

    return data;
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