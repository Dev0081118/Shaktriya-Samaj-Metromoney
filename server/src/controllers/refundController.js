import mongoose from 'mongoose';

import {
  Payment,
  RefundRequest
} from '../models/Platform.js';

import {
  paymentService
} from '../services/paymentService.js';

import {
  reconcileRefund
} from '../services/refundService.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

const validId =
  (
    value
  ) => {
    if (
      !mongoose.isValidObjectId(
        value
      )
    ) {
      throw new ApiError(
        400,
        'Invalid payment ID.'
      );
    }
  };

/*
 * Manually ask Razorpay for the latest status
 * of the currently pending refund.
 *
 * This makes local development possible without
 * ngrok and provides a production fallback if a
 * webhook is delayed or missed.
 */
export const syncRefund =
  asyncHandler(
    async (
      req,
      res
    ) => {
      validId(
        req.params.id
      );

      const payment =
        await Payment.findById(
          req.params.id
        );

      if (!payment) {
        throw new ApiError(
          404,
          'Payment not found.'
        );
      }

      if (
        payment.provider !==
        'razorpay'
      ) {
        throw new ApiError(
          409,
          'Only Razorpay refunds can be synchronized.'
        );
      }

      const refund =
        await RefundRequest.findOne({
          payment:
            payment._id,

          status: {
            $in: [
              'Requested',
              'Submitted'
            ]
          },

          providerRefundId: {
            $exists:
              true,

            $ne:
              ''
          }
        }).sort(
          '-createdAt'
        );

      if (!refund) {
        /*
         * Maybe the record is already terminal.
         * Return latest history rather than producing
         * a confusing hard failure.
         */
        const latest =
          await RefundRequest.findOne({
            payment:
              payment._id
          })
            .populate(
              'requestedBy',
              'email role'
            )
            .sort(
              '-createdAt'
            );

        if (latest) {
          return ok(
            res,
            {
              payment,

              refund:
                latest,

              providerStatus:
                latest.status ===
                'Processed'
                  ? 'processed'
                  : latest.status ===
                      'Failed'
                    ? 'failed'
                    : 'unknown',

              changed:
                false
            },

            'Refund is already in a terminal state.'
          );
        }

        throw new ApiError(
          404,
          'No refund request exists for this payment.'
        );
      }

      const providerRefund =
        await paymentService.fetchRefund(
          refund.providerRefundId
        );

      if (
        String(
          providerRefund.payment_id ||
            ''
        ) !==
        String(
          payment.providerPaymentId ||
            ''
        )
      ) {
        throw new ApiError(
          409,
          'Razorpay returned a refund for a different payment.'
        );
      }

      const result =
        await reconcileRefund({
          providerRefund,

          actor:
            req.user._id,

          requestId:
            req.id
        });

      const updatedPayment =
        await Payment.findById(
          payment._id
        );

      const updatedRefund =
        await RefundRequest.findById(
          refund._id
        ).populate(
          'requestedBy',
          'email role'
        );

      ok(
        res,
        {
          payment:
            updatedPayment,

          refund:
            updatedRefund,

          providerStatus:
            result.providerStatus,

          changed:
            result.changed,

          fullRefund:
            Boolean(
              result.fullRefund
            )
        },

        result.providerStatus ===
        'processed'
          ? 'Refund status synchronized successfully.'
          : result.providerStatus ===
              'failed'
            ? 'Refund failure synchronized.'
            : 'Refund is still processing at Razorpay.'
      );
    }
  );