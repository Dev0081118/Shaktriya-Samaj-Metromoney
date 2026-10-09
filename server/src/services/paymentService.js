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

const razorpayConfig =
  () => {
    const keyId =
      String(
        process.env
          .RAZORPAY_KEY_ID ||
          ''
      ).trim();

    const keySecret =
      String(
        process.env
          .RAZORPAY_KEY_SECRET ||
          ''
      ).trim();

    if (
      !keyId ||
      !keySecret
    ) {
      throw new ApiError(
        503,
        'Payment provider is not configured.'
      );
    }

    return {
      keyId,
      keySecret
    };
  };

const razorpayAuth =
  () => {
    const {
      keyId,
      keySecret
    } =
      razorpayConfig();

    return Buffer.from(
      `${keyId}:${keySecret}`
    ).toString(
      'base64'
    );
  };

const parseProviderResponse =
  async (
    response
  ) => {
    /*
     * Real fetch responses support text().
     *
     * Some integration-test mocks expose only
     * json(), so support both safely.
     */
    if (
      typeof response?.text ===
      'function'
    ) {
      const rawText =
        await response.text();

      if (!rawText) {
        return {};
      }

      try {
        return JSON.parse(
          rawText
        );
      } catch {
        return {
          raw:
            rawText.slice(
              0,
              1000
            )
        };
      }
    }

    if (
      typeof response?.json ===
      'function'
    ) {
      try {
        return await response.json();
      } catch {
        return {};
      }
    }

    return {};
  };

const providerRequest =
  async (
    url,
    options = {},
    fallbackMessage =
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

              Accept:
                'application/json',

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
                15000
              )
          }
        );
    } catch (
      error
    ) {
      console.error(
        'RAZORPAY NETWORK ERROR:',
        {
          name:
            error?.name ||
            'Error',

          message:
            error?.message ||
            'Unknown network error'
        }
      );

      throw new ApiError(
        502,
        fallbackMessage
      );
    }

    const data =
      await parseProviderResponse(
        response
      );

    return {
      response,
      data
    };
  };

const providerErrorMessage =
  (
    data,
    fallback
  ) =>
    data?.error
      ?.description ||
    data?.error
      ?.reason ||
    data?.description ||
    data?.message ||
    fallback;

const providerErrorDetails =
  (
    response,
    data
  ) => ({
    httpStatus:
      response?.status ||
      null,

    errorCode:
      data?.error
        ?.code ||
      null,

    description:
      data?.error
        ?.description ||
      data?.description ||
      null,

    source:
      data?.error
        ?.source ||
      null,

    step:
      data?.error
        ?.step ||
      null,

    reason:
      data?.error
        ?.reason ||
      null,

    metadata:
      data?.error
        ?.metadata ||
      null
  });

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
      const numericAmount =
        Number(
          amount
        );

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <=
          0
      ) {
        throw new ApiError(
          400,
          'A valid payment amount is required.'
        );
      }

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
                    numericAmount *
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
        !data?.id
      ) {
        console.error(
          'RAZORPAY ORDER ERROR:',
          providerErrorDetails(
            response,
            data
          )
        );

        throw new ApiError(
          502,
          providerErrorMessage(
            data,
            'Unable to create a secure payment order.'
          )
        );
      }

      return {
        provider:
          'razorpay',

        providerOrderId:
          data.id,

        amount:
          numericAmount,

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
    const secret =
      String(
        process.env
          .RAZORPAY_KEY_SECRET ||
          ''
      ).trim();

    if (!secret) {
      throw new ApiError(
        503,
        'Payment verification is not configured.'
      );
    }

    if (
      !orderId ||
      !paymentId ||
      !provided
    ) {
      throw new ApiError(
        400,
        'Payment verification details are incomplete.'
      );
    }

    if (
      !safeEqual(
        signature(
          `${orderId}|${paymentId}`,
          secret
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
      !data?.id
    ) {
      console.error(
        'RAZORPAY PAYMENT FETCH ERROR:',
        {
          paymentId,

          ...providerErrorDetails(
            response,
            data
          )
        }
      );

      throw new ApiError(
        502,
        providerErrorMessage(
          data,
          'Unable to confirm payment with the payment provider.'
        )
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
    if (!paymentId) {
      throw new ApiError(
        400,
        'Payment identifier is required.'
      );
    }

    if (
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

    if (!refundRequestId) {
      throw new ApiError(
        400,
        'Refund request identifier is required.'
      );
    }

    /*
     * Do not pre-fetch the Razorpay payment here.
     *
     * The refund endpoint itself validates whether
     * the payment exists, belongs to the account,
     * is captured, and still has refundable balance.
     *
     * Avoiding a second provider request also:
     * - reduces latency
     * - avoids race conditions between GET + refund
     * - keeps test/provider behaviour deterministic
     */
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
                    reason ||
                    ''
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
        'RAZORPAY REFUND ERROR:',
        {
          paymentId,

          amountPaise,

          refundRequestId:
            String(
              refundRequestId
            ),

          ...providerErrorDetails(
            response,
            data
          )
        }
      );

      throw new ApiError(
        502,
        providerErrorMessage(
          data,
          'Payment provider rejected the refund request.'
        )
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
        )
          .trim()
          .toLowerCase(),

      raw:
        data
    };
  },

  async fetchRefund(
    refundId
  ) {
    if (!refundId) {
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
      console.error(
        'RAZORPAY REFUND FETCH ERROR:',
        {
          refundId,

          ...providerErrorDetails(
            response,
            data
          )
        }
      );

      throw new ApiError(
        502,
        providerErrorMessage(
          data,
          'Unable to fetch refund status from the payment provider.'
        )
      );
    }

    return data;
  },

  verifyWebhook(
    rawBody,
    provided
  ) {
    const secret =
      String(
        process.env
          .RAZORPAY_WEBHOOK_SECRET ||
          ''
      ).trim();

    if (!secret) {
      throw new ApiError(
        503,
        'Payment webhook is not configured.'
      );
    }

    if (!provided) {
      throw new ApiError(
        400,
        'Webhook signature is missing.'
      );
    }

    if (
      !safeEqual(
        signature(
          rawBody,
          secret
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