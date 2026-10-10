import {
  Payment,
  RefundRequest
} from '../models/Platform.js';

import {
  paymentService
} from '../services/paymentService.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

const allowedRanges = [
  '7d',
  '30d',
  '90d',
  'this_year'
];

const toPaise = (
  value
) =>
  Math.round(
    Number(
      value ||
        0
    ) *
      100
  );

const toRupees = (
  value
) =>
  Number(
    (
      Number(
        value ||
          0
      ) /
      100
    ).toFixed(
      2
    )
  );

const dateKey = (
  value
) => {
  if (!value) {
    return null;
  }

  return new Date(
    value
  )
    .toISOString()
    .slice(
      0,
      10
    );
};

const resolveRange = (
  requested
) => {
  const range =
    allowedRanges.includes(
      requested
    )
      ? requested
      : '30d';

  const now =
    new Date();

  let from;

  if (
    range ===
    'this_year'
  ) {
    from =
      new Date(
        now.getFullYear(),
        0,
        1
      );
  } else {
    const days =
      range ===
      '7d'
        ? 7
        : range ===
            '90d'
          ? 90
          : 30;

    from =
      new Date(
        now.getTime() -
          days *
            864e5
      );
  }

  return {
    range,
    from,
    to:
      now
  };
};

const ensureDaily = (
  map,
  key
) => {
  if (
    !map.has(
      key
    )
  ) {
    map.set(
      key,
      {
        date:
          key,

        grossPaise:
          0,

        refundPaise:
          0,

        gatewayFeePaise:
          0,

        gatewayTaxPaise:
          0,

        capturedCount:
          0,

        refundCount:
          0
      }
    );
  }

  return map.get(
    key
  );
};

const ensurePlan = (
  map,
  key
) => {
  if (
    !map.has(
      key
    )
  ) {
    map.set(
      key,
      {
        plan:
          key,

        grossPaise:
          0,

        refundPaise:
          0,

        gatewayFeePaise:
          0,

        gatewayTaxPaise:
          0,

        capturedCount:
          0,

        refundCount:
          0
      }
    );
  }

  return map.get(
    key
  );
};

const buildRevenue =
  async (
    requestedRange
  ) => {
    const {
      range,
      from,
      to
    } =
      resolveRange(
        requestedRange
      );

    /*
     * Gross revenue is counted only from verified,
     * captured local payments.
     */
    const [
      capturedPayments,
      processedRefunds,
      legacyRefundedPayments,
      failedCount
    ] =
      await Promise.all([
        Payment.find({
          verifiedAt: {
            $gte:
              from,

            $lte:
              to
          },

          status: {
            $in: [
              'Paid',
              'Refunded'
            ]
          }
        })
          .populate(
            'plan',
            'name slug'
          )
          .sort(
            'verifiedAt'
          )
          .lean(),

        /*
         * Modern refund accounting:
         * use the refund processing timestamp so a
         * refund is attributed to the period in
         * which it actually completed.
         */
        RefundRequest.find({
          status:
            'Processed',

          processedAt: {
            $gte:
              from,

            $lte:
              to
          }
        })
          .populate({
            path:
              'payment',

            select:
              'plan amount providerPaymentId',

            populate: {
              path:
                'plan',

              select:
                'name slug'
            }
          })
          .sort(
            'processedAt'
          )
          .lean(),

        /*
         * Legacy compatibility:
         *
         * Older records/tests may have status
         * Refunded without RefundRequest history.
         *
         * They must still appear in revenue reports.
         */
        Payment.find({
          status:
            'Refunded',

          createdAt: {
            $gte:
              from,

            $lte:
              to
          }
        })
          .populate(
            'plan',
            'name slug'
          )
          .lean(),

        Payment.countDocuments({
          status:
            'Failed',

          createdAt: {
            $gte:
              from,

            $lte:
              to
          }
        })
      ]);

    let grossCapturedPaise =
      0;

    let refundPaise =
      0;

    let gatewayFeePaise =
      0;

    let gatewayTaxPaise =
      0;

    let razorpayPayments =
      0;

    let syncedPayments =
      0;

    const daily =
      new Map();

    const byPlan =
      new Map();

    const processedRefundPaymentIds =
      new Set();

    for (
      const payment
      of capturedPayments
    ) {
      const gross =
        toPaise(
          payment.amount
        );

      const fee =
        Math.max(
          0,

          Number(
            payment.providerFeePaise ||
              0
          )
        );

      const tax =
        Math.min(
          fee,

          Math.max(
            0,

            Number(
              payment.providerTaxPaise ||
                0
            )
          )
        );

      grossCapturedPaise +=
        gross;

      gatewayFeePaise +=
        fee;

      gatewayTaxPaise +=
        tax;

      if (
        payment.provider ===
        'razorpay'
      ) {
        razorpayPayments +=
          1;

        if (
          payment.providerFinancialSyncedAt
        ) {
          syncedPayments +=
            1;
        }
      }

      const key =
        dateKey(
          payment.verifiedAt
        );

      if (key) {
        const row =
          ensureDaily(
            daily,
            key
          );

        row.grossPaise +=
          gross;

        row.gatewayFeePaise +=
          fee;

        row.gatewayTaxPaise +=
          tax;

        row.capturedCount +=
          1;
      }

      const planName =
        payment.plan
          ?.name ||
        'Historical plan';

      const planRow =
        ensurePlan(
          byPlan,
          planName
        );

      planRow.grossPaise +=
        gross;

      planRow.gatewayFeePaise +=
        fee;

      planRow.gatewayTaxPaise +=
        tax;

      planRow.capturedCount +=
        1;
    }

    /*
     * Modern processed refund accounting.
     */
    for (
      const refund
      of processedRefunds
    ) {
      const amount =
        Math.max(
          0,

          Number(
            refund.amountPaise ||
              0
          )
        );

      refundPaise +=
        amount;

      if (
        refund.payment
          ?._id
      ) {
        processedRefundPaymentIds.add(
          String(
            refund.payment
              ._id
          )
        );
      }

      const key =
        dateKey(
          refund.processedAt
        );

      if (key) {
        const row =
          ensureDaily(
            daily,
            key
          );

        row.refundPaise +=
          amount;

        row.refundCount +=
          1;
      }

      const planName =
        refund.payment
          ?.plan
          ?.name ||
        'Historical plan';

      const planRow =
        ensurePlan(
          byPlan,
          planName
        );

      planRow.refundPaise +=
        amount;

      planRow.refundCount +=
        1;
    }

    /*
     * Legacy fully-refunded payment fallback.
     *
     * Do not count it when modern RefundRequest
     * history already represents that payment.
     */
    for (
      const payment
      of legacyRefundedPayments
    ) {
      const paymentId =
        String(
          payment._id
        );

      if (
        processedRefundPaymentIds.has(
          paymentId
        )
      ) {
        continue;
      }

      /*
       * Prefer real refund counters when present.
       * Otherwise status Refunded means the whole
       * historical transaction was refunded.
       */
      const storedRefundPaise =
        Math.max(
          Number(
            payment.refundedAmountPaise ||
              0
          ),

          Number(
            payment.providerRefundedAmountPaise ||
              0
          )
        );

      const amount =
        storedRefundPaise >
        0
          ? storedRefundPaise
          : toPaise(
              payment.amount
            );

      refundPaise +=
        amount;

      const key =
        dateKey(
          payment.updatedAt ||
            payment.createdAt
        );

      if (key) {
        const row =
          ensureDaily(
            daily,
            key
          );

        row.refundPaise +=
          amount;

        row.refundCount +=
          1;
      }

      const planName =
        payment.plan
          ?.name ||
        'Historical plan';

      const planRow =
        ensurePlan(
          byPlan,
          planName
        );

      planRow.refundPaise +=
        amount;

      planRow.refundCount +=
        1;
    }

    const customerNetPaise =
      grossCapturedPaise -
      refundPaise;

    /*
     * Razorpay `fee` already includes GST.
     *
     * Therefore tax is shown separately as a
     * breakdown but must not be deducted again.
     */
    const estimatedNetAfterGatewayPaise =
      customerNetPaise -
      gatewayFeePaise;

    const gatewayBaseFeePaise =
      Math.max(
        0,

        gatewayFeePaise -
          gatewayTaxPaise
      );

    const dailyRows =
      Array.from(
        daily.values()
      )
        .sort(
          (
            a,
            b
          ) =>
            a.date.localeCompare(
              b.date
            )
        )
        .map(
          (
            row
          ) => {
            const net =
              row.grossPaise -
              row.refundPaise;

            return {
              date:
                row.date,

              /*
               * Modern fields.
               */
              gross:
                toRupees(
                  row.grossPaise
                ),

              refunded:
                toRupees(
                  row.refundPaise
                ),

              net:
                toRupees(
                  net
                ),

              gatewayFee:
                toRupees(
                  row.gatewayFeePaise
                ),

              estimatedNetAfterGateway:
                toRupees(
                  net -
                    row.gatewayFeePaise
                ),

              capturedCount:
                row.capturedCount,

              refundCount:
                row.refundCount,

              /*
               * Backward compatibility with the
               * original RevenuePage contract.
               */
              amount:
                toRupees(
                  row.grossPaise
                ),

              count:
                row.capturedCount
            };
          }
        );

    const revenueByPlan =
      Array.from(
        byPlan.values()
      )
        .map(
          (
            row
          ) => {
            const net =
              row.grossPaise -
              row.refundPaise;

            return {
              plan:
                row.plan,

              gross:
                toRupees(
                  row.grossPaise
                ),

              refunded:
                toRupees(
                  row.refundPaise
                ),

              net:
                toRupees(
                  net
                ),

              gatewayFee:
                toRupees(
                  row.gatewayFeePaise
                ),

              estimatedNetAfterGateway:
                toRupees(
                  net -
                    row.gatewayFeePaise
                ),

              capturedCount:
                row.capturedCount,

              refundCount:
                row.refundCount,

              /*
               * Original API aliases.
               */
              amount:
                toRupees(
                  row.grossPaise
                ),

              count:
                row.capturedCount
            };
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            b.gross -
            a.gross
        );

    const grossCaptured =
      toRupees(
        grossCapturedPaise
      );

    const totalRefunded =
      toRupees(
        refundPaise
      );

    const customerNet =
      toRupees(
        customerNetPaise
      );

    return {
      range,

      from,

      to,

      /*
       * Modern names.
       */
      grossCaptured,

      totalRefunded,

      customerNet,

      gatewayFee:
        toRupees(
          gatewayFeePaise
        ),

      gatewayBaseFee:
        toRupees(
          gatewayBaseFeePaise
        ),

      gatewayTax:
        toRupees(
          gatewayTaxPaise
        ),

      estimatedNetAfterGateway:
        toRupees(
          estimatedNetAfterGatewayPaise
        ),

      paymentCount:
        capturedPayments.length,

      refundCount:
        processedRefunds.length,

      failedCount,

      reconciliation: {
        razorpayPayments,

        syncedPayments,

        unsyncedPayments:
          Math.max(
            0,

            razorpayPayments -
              syncedPayments
          )
      },

      daily:
        dailyRows,

      revenueByPlan,

      /*
       * Backward compatible aliases.
       *
       * Existing integrations/tests should not
       * break just because the revenue model grew.
       */
      totalCaptured:
        grossCaptured,

      netCaptured:
        customerNet
    };
  };

export const revenue =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const result =
        await buildRevenue(
          req.query.range
        );

      ok(
        res,
        result
      );
    }
  );

export const syncRazorpayRevenue =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        range,
        from,
        to
      } =
        resolveRange(
          req.body.range
        );

      const requestedLimit =
        Number.parseInt(
          req.body.limit,
          10
        );

      const limit =
        Math.min(
          100,

          Math.max(
            1,

            Number.isFinite(
              requestedLimit
            )
              ? requestedLimit
              : 50
          )
        );

      const query = {
        provider:
          'razorpay',

        providerPaymentId: {
          $exists:
            true,

          $ne:
            ''
        },

        verifiedAt: {
          $gte:
            from,

          $lte:
            to
        },

        status: {
          $in: [
            'Paid',
            'Refunded'
          ]
        }
      };

      const totalCandidates =
        await Payment.countDocuments(
          query
        );

      /*
       * Unsynced records first.
       *
       * Oldest provider sync timestamp is processed
       * first, while fresh payment date breaks ties.
       */
      const payments =
        await Payment.find(
          query
        )
          .sort({
            providerFinancialSyncedAt:
              1,

            verifiedAt:
              -1
          })
          .limit(
            limit
          );

      let synced =
        0;

      let failed =
        0;

      const failures =
        [];

      for (
        const payment
        of payments
      ) {
        try {
          const providerPayment =
            await paymentService.fetchPayment(
              payment.providerPaymentId
            );

          if (
            providerPayment.id !==
            payment.providerPaymentId
          ) {
            throw new ApiError(
              409,
              'Provider payment identifier mismatch.'
            );
          }

          const providerAmount =
            Number(
              providerPayment.amount
            );

          if (
            Number.isFinite(
              providerAmount
            ) &&
            providerAmount !==
              toPaise(
                payment.amount
              )
          ) {
            throw new ApiError(
              409,
              'Provider payment amount does not match the local payment.'
            );
          }

          payment.providerFeePaise =
            Math.max(
              0,

              Number(
                providerPayment.fee ||
                  0
              )
            );

          payment.providerTaxPaise =
            Math.max(
              0,

              Number(
                providerPayment.tax ||
                  0
              )
            );

          payment.providerRefundedAmountPaise =
            Math.max(
              0,

              Number(
                providerPayment.amount_refunded ||
                  0
              )
            );

          payment.providerMethod =
            providerPayment.method ||
            undefined;

          payment.providerRefundStatus =
            providerPayment.refund_status ||
            undefined;

          payment.providerCapturedAt =
            providerPayment.created_at
              ? new Date(
                  Number(
                    providerPayment.created_at
                  ) *
                    1000
                )
              : payment.verifiedAt;

          payment.providerFinancialSyncedAt =
            new Date();

          await payment.save();

          synced +=
            1;
        } catch (
          error
        ) {
          failed +=
            1;

          failures.push({
            paymentId:
              String(
                payment._id
              ),

            providerPaymentId:
              payment.providerPaymentId,

            message:
              error.message ||
              'Unable to sync payment.'
          });
        }
      }

      const summary =
        await buildRevenue(
          range
        );

      ok(
        res,
        {
          range,

          attempted:
            payments.length,

          synced,

          failed,

          totalCandidates,

          remaining:
            Math.max(
              0,

              totalCandidates -
                payments.length
            ),

          failures,

          summary
        },

        failed
          ? 'Razorpay reconciliation completed with some failures.'
          : 'Razorpay reconciliation completed.'
      );
    }
  );