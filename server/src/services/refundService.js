import {
  Payment,
  RefundRequest,
  Subscription,
  Notification
} from '../models/Platform.js';

import {
  AuditLog
} from '../models/Business.js';

import {
  ApiError
} from '../utils/http.js';

const amountInPaise = (
  amount
) =>
  Math.round(
    Number(
      amount ||
        0
    ) *
      100
  );

const normalizedRefundStatus =
  (
    status
  ) =>
    String(
      status ||
        ''
    )
      .trim()
      .toLowerCase();

const refundFailureMessage =
  (
    entity
  ) =>
    String(
      entity
        ?.error_description ||
        entity
          ?.error?.description ||
        entity
          ?.error_reason ||
        'Refund failed at payment provider.'
    ).slice(
      0,
      1000
    );

const writeAudit =
  async ({
    actor,
    action,
    payment,
    refundRequest,
    providerRefund,
    requestId,
    metadata = {}
  }) => {
    await AuditLog.create({
      ...(actor
        ? {
            actor
          }
        : {}),

      action,

      entityType:
        'Payment',

      entityId:
        String(
          payment._id
        ),

      metadata: {
        providerRefundId:
          providerRefund?.id ||
          refundRequest
            ?.providerRefundId ||
          null,

        refundRequest:
          refundRequest
            ? String(
                refundRequest._id
              )
            : null,

        ...metadata
      },

      ...(requestId
        ? {
            requestId
          }
        : {})
    });
  };

/*
 * Single source of truth for applying Razorpay
 * refund state to our own database.
 *
 * Used by:
 * 1. webhook
 * 2. manual Admin Sync
 * 3. immediate provider response if needed later
 */
export async function reconcileRefund({
  providerRefund,
  actor = null,
  requestId = null
}) {
  if (
    !providerRefund?.id ||
    !providerRefund
      ?.payment_id
  ) {
    throw new ApiError(
      400,
      'Refund provider response is incomplete.'
    );
  }

  const amountPaise =
    Number(
      providerRefund.amount ||
        0
    );

  if (
    !Number.isFinite(
      amountPaise
    ) ||
    amountPaise <=
      0
  ) {
    throw new ApiError(
      400,
      'Refund amount is invalid.'
    );
  }

  const payment =
    await Payment.findOne({
      providerPaymentId:
        providerRefund.payment_id
    });

  if (!payment) {
    throw new ApiError(
      404,
      'Payment for this refund was not found.'
    );
  }

  const refundRequest =
    await RefundRequest.findOne({
      providerRefundId:
        providerRefund.id
    });

  if (
    refundRequest &&
    String(
      refundRequest.payment
    ) !==
      String(
        payment._id
      )
  ) {
    throw new ApiError(
      409,
      'Refund request does not belong to this payment.'
    );
  }

  if (
    refundRequest &&
    Number(
      refundRequest.amountPaise
    ) !==
      amountPaise
  ) {
    throw new ApiError(
      409,
      'Refund amount does not match the original refund request.'
    );
  }

  const status =
    normalizedRefundStatus(
      providerRefund.status
    );

  /*
   * Razorpay may report created/pending/processed.
   * Non-terminal state remains pending locally.
   */
  if (
    ![
      'processed',
      'failed'
    ].includes(
      status
    )
  ) {
    if (
      refundRequest &&
      ![
        'Processed',
        'Failed'
      ].includes(
        refundRequest.status
      )
    ) {
      refundRequest.status =
        'Submitted';

      await refundRequest.save();
    }

    return {
      payment,
      refundRequest,
      providerStatus:
        status ||
        'pending',

      changed:
        false,

      terminal:
        false
    };
  }

  /*
   * Refund-level idempotency.
   *
   * This prevents:
   * - duplicate webhook deliveries
   * - webhook + manual sync race
   * - repeated Sync button clicks
   */
  if (
    status ===
      'processed' &&
    refundRequest
      ?.status ===
      'Processed'
  ) {
    return {
      payment,
      refundRequest,
      providerStatus:
        status,

      changed:
        false,

      terminal:
        true
    };
  }

  if (
    status ===
      'failed' &&
    refundRequest
      ?.status ===
      'Failed'
  ) {
    return {
      payment,
      refundRequest,
      providerStatus:
        status,

      changed:
        false,

      terminal:
        true
    };
  }

  if (
    status ===
    'failed'
  ) {
    payment.refundPendingPaise =
      Math.max(
        0,

        Number(
          payment
            .refundPendingPaise ||
            0
        ) -
          amountPaise
      );

    await payment.save();

    if (
      refundRequest
    ) {
      refundRequest.status =
        'Failed';

      refundRequest.failureMessage =
        refundFailureMessage(
          providerRefund
        );

      await refundRequest.save();
    }

    await writeAudit({
      actor,
      action:
        'payment.refund.failed',
      payment,
      refundRequest,
      providerRefund,
      requestId,
      metadata: {
        amountPaise,

        failureMessage:
          refundFailureMessage(
            providerRefund
          )
      }
    });

    return {
      payment,
      refundRequest,
      providerStatus:
        status,

      changed:
        true,

      terminal:
        true
    };
  }

  const originalAmountPaise =
    amountInPaise(
      payment.amount
    );

  const alreadyRefunded =
    Number(
      payment
        .refundedAmountPaise ||
        0
    );

  const nextRefunded =
    Math.min(
      originalAmountPaise,

      alreadyRefunded +
        amountPaise
    );

  payment.refundedAmountPaise =
    nextRefunded;

  payment.refundPendingPaise =
    Math.max(
      0,

      Number(
        payment
          .refundPendingPaise ||
          0
      ) -
        amountPaise
    );

  const fullRefund =
    nextRefunded >=
    originalAmountPaise;

  if (
    fullRefund
  ) {
    payment.status =
      'Refunded';

    payment.refundPendingPaise =
      0;
  } else {
    payment.status =
      'Paid';
  }

  await payment.save();

  if (
    fullRefund &&
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

  if (
    refundRequest
  ) {
    refundRequest.status =
      'Processed';

    refundRequest.processedAt =
      new Date();

    refundRequest.failureMessage =
      undefined;

    await refundRequest.save();
  }

  await writeAudit({
    actor,
    action:
      'payment.refund.processed',
    payment,
    refundRequest,
    providerRefund,
    requestId,
    metadata: {
      refundAmountPaise:
        amountPaise,

      cumulativeRefundedPaise:
        nextRefunded,

      fullRefund
    }
  });

  await Notification.create({
    user:
      payment.user,

    type:
      'SYSTEM',

    title:
      fullRefund
        ? 'Payment refunded'
        : 'Partial refund processed',

    message:
      fullRefund
        ? 'Your payment has been fully refunded. The related membership has been cancelled.'
        : `A partial refund of INR ${(
            amountPaise /
            100
          ).toFixed(
            2
          )} has been processed.`
  });

  return {
    payment,
    refundRequest,
    providerStatus:
      status,

    changed:
      true,

    terminal:
      true,

    fullRefund
  };
}