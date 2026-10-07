import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  api
} from '../../services/api';

import {
  useToast
} from '../../context/ToastContext';

import {
  formatCurrency,
  formatDate
} from '../../utils/formatters';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-50";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] text-[#191614] outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const reasons = [
  [
    'duplicate_payment',
    'Duplicate payment'
  ],
  [
    'technical_failure',
    'Technical failure'
  ],
  [
    'membership_activation_failure',
    'Membership activation failure'
  ],
  [
    'incorrect_plan',
    'Incorrect plan provisioned'
  ],
  [
    'admin_exception',
    'Admin-approved exception'
  ],
  [
    'other',
    'Other'
  ]
];

const terminalStatus =
  (
    status
  ) =>
    [
      'Processed',
      'Failed'
    ].includes(
      status
    );

export default function RefundPaymentModal({
  payment,
  onClose,
  onSubmitted
}) {
  const notify =
    useToast();

  const [
    type,
    setType
  ] =
    useState(
      'full'
    );

  const [
    amount,
    setAmount
  ] =
    useState(
      ''
    );

  const [
    reasonCode,
    setReasonCode
  ] =
    useState(
      'duplicate_payment'
    );

  const [
    reason,
    setReason
  ] =
    useState(
      ''
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );

  const [
    syncing,
    setSyncing
  ] =
    useState(
      false
    );

  const [
    history,
    setHistory
  ] =
    useState(
      []
    );

  const [
    historyLoading,
    setHistoryLoading
  ] =
    useState(
      true
    );

  const [
    localPayment,
    setLocalPayment
  ] =
    useState(
      payment
    );

const paymentId =
  payment?._id;

const loadHistory =
  useCallback(
    async () => {
      if (
        !paymentId
      ) {
        return;
      }

      setHistoryLoading(
        true
      );

      try {
        const response =
          await api(
            `/admin/payments/${paymentId}/refunds`
          );

        setHistory(
          response
            .data
            ?.refunds ||
            []
        );

        if (
          response
            .data
            ?.payment
        ) {
          setLocalPayment(
            response
              .data
              .payment
          );
        }
      } catch {
        setHistory(
          []
        );
      } finally {
        setHistoryLoading(
          false
        );
      }
    },

    [
      paymentId
    ]
  );

  useEffect(
    () => {
      let active =
        true;

      const load =
        async () => {
          if (
            !active
          ) {
            return;
          }

          await loadHistory();
        };

      load();

      return () => {
        active =
          false;
      };
    },

    [
      loadHistory
    ]
  );

  const original =
    Number(
      localPayment
        ?.amount ||
        payment?.amount ||
        0
    );

  const refunded =
    Number(
      localPayment
        ?.refundedAmountPaise ||
        0
    ) /
    100;

  const pending =
    Number(
      localPayment
        ?.refundPendingPaise ||
        0
    ) /
    100;

  const remaining =
    Math.max(
      0,

      original -
        refunded -
        pending
    );

  const latestRefund =
    history[
      0
    ] ||
    null;

  const hasPendingRefund =
    Boolean(
      latestRefund &&
      !terminalStatus(
        latestRefund.status
      ) &&
      latestRefund
        .providerRefundId
    );

  const canRefund =
    localPayment
      ?.status ===
      'Paid' &&
    localPayment
      ?.provider ===
      'razorpay' &&
    Boolean(
      localPayment
        ?.providerPaymentId
    ) &&
    pending ===
      0 &&
    remaining >
      0;

  const selectedAmount =
    useMemo(
      () =>
        type ===
        'full'
          ? remaining
          : Number(
              amount ||
                0
            ),

      [
        type,
        amount,
        remaining
      ]
    );

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !canRefund
      ) {
        return;
      }

      if (
        reason
          .trim()
          .length <
        10
      ) {
        notify(
          'Please enter a meaningful refund reason.',
          'error'
        );

        return;
      }

      if (
        type ===
        'partial'
      ) {
        const partial =
          Number(
            amount
          );

        if (
          !Number.isFinite(
            partial
          ) ||
          partial <=
            0 ||
          partial >=
            remaining
        ) {
          notify(
            'Partial refund must be greater than zero and lower than the remaining amount.',
            'error'
          );

          return;
        }
      }

      setLoading(
        true
      );

      try {
        await api(
          `/admin/payments/${payment._id}/refund`,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                type,

                ...(type ===
                'partial'
                  ? {
                      amount:
                        Number(
                          amount
                        )
                    }
                  : {}),

                reasonCode,

                reason:
                  reason.trim()
              })
          }
        );

        notify(
          'Refund submitted to Razorpay.'
        );

        await loadHistory();

        await onSubmitted?.();
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  const syncStatus =
    async () => {
      if (
        !payment?._id
      ) {
        return;
      }

      setSyncing(
        true
      );

      try {
        const response =
          await api(
            `/admin/payments/${payment._id}/refund/sync`,
            {
              method:
                'POST'
            }
          );

        const providerStatus =
          response
            .data
            ?.providerStatus;

        if (
          providerStatus ===
          'processed'
        ) {
          notify(
            'Refund confirmed by Razorpay and synchronized.'
          );
        } else if (
          providerStatus ===
          'failed'
        ) {
          notify(
            'Razorpay reports that this refund failed.',
            'error'
          );
        } else {
          notify(
            'Refund is still processing at Razorpay.'
          );
        }

        await loadHistory();

        await onSubmitted?.();
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setSyncing(
          false
        );
      }
    };

  if (
    !payment
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[#1d1110cc] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-payment-title"
        className="my-8 w-full max-w-[680px] border border-[#b89a65] bg-[#fffdf8] p-7 shadow-[0_30px_100px_#0007]"
      >
        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#91683f]">
          Admin payment operation
        </p>

        <h2
          id="refund-payment-title"
          className="mt-2 font-['Cormorant_Garamond'] text-[36px] font-medium text-[#2c1a18]"
        >
          Refund payment
        </h2>

        <p className="mt-2 break-all text-[11px] leading-6 text-[#756a60]">
          {localPayment
            ?.providerPaymentId ||
            payment
              .providerPaymentId ||
            'No Razorpay payment ID'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
          <article className="border border-[#ddd0c1] p-4">
            <strong className="block text-[16px]">
              {formatCurrency(
                original
              )}
            </strong>

            <span className="text-[9px] uppercase text-[#756a60]">
              Original
            </span>
          </article>

          <article className="border border-[#ddd0c1] p-4">
            <strong className="block text-[16px]">
              {formatCurrency(
                refunded
              )}
            </strong>

            <span className="text-[9px] uppercase text-[#756a60]">
              Refunded
            </span>
          </article>

          <article className="border border-[#ddd0c1] p-4">
            <strong className="block text-[16px]">
              {formatCurrency(
                Math.max(
                  0,
                  original -
                    refunded
                )
              )}
            </strong>

            <span className="text-[9px] uppercase text-[#756a60]">
              Refundable
            </span>
          </article>
        </div>

        {pending >
          0 && (
          <div className="mt-5 border border-[#d9b76d] bg-[#fff7df] p-4 text-[12px] leading-6 text-[#6c4b10]">
            <strong>
              Refund pending{' '}
              {formatCurrency(
                pending
              )}
            </strong>

            <p className="mt-1">
              Razorpay confirmation has not yet been applied to this database.
            </p>

            <button
              type="button"
              className={`${outlineButtonClass} mt-3`}
              disabled={
                syncing
              }
              onClick={
                syncStatus
              }
            >
              {syncing
                ? 'Checking Razorpay…'
                : 'Sync status with Razorpay'}
            </button>
          </div>
        )}

        {hasPendingRefund &&
          pending ===
            0 && (
          <div className="mt-5 border border-[#d9b76d] bg-[#fff7df] p-4 text-[12px] leading-6 text-[#6c4b10]">
            A refund request is waiting for provider reconciliation.

            <button
              type="button"
              className={`${outlineButtonClass} mt-3`}
              disabled={
                syncing
              }
              onClick={
                syncStatus
              }
            >
              {syncing
                ? 'Checking Razorpay…'
                : 'Sync status with Razorpay'}
            </button>
          </div>
        )}

        {!canRefund &&
          pending ===
            0 &&
          !hasPendingRefund &&
          localPayment
            ?.status !==
            'Refunded' && (
          <div className="mt-5 border border-[#d7b4b4] bg-[#fff3f3] p-4 text-[12px] leading-6 text-[#681d25]">
            This transaction is not currently eligible for another admin refund.
          </div>
        )}

        {localPayment
          ?.status ===
          'Refunded' && (
          <div className="mt-5 border border-[#9fc6ac] bg-[#edf8f0] p-4 text-[12px] leading-6 text-[#255b35]">
            <strong>
              Fully refunded
            </strong>

            <p className="mt-1">
              Razorpay has confirmed the complete refund and the related active membership has been cancelled.
            </p>
          </div>
        )}

        {canRefund && (
          <form
            className="mt-6 grid gap-5"
            onSubmit={
              submit
            }
          >
            <label className={labelClass}>
              Refund type

              <select
                className={inputClass}
                value={
                  type
                }
                onChange={(
                  event
                ) =>
                  setType(
                    event
                      .target
                      .value
                  )
                }
              >
                <option value="full">
                  Full remaining refund
                </option>

                <option value="partial">
                  Partial refund
                </option>
              </select>
            </label>

            {type ===
              'partial' && (
              <label className={labelClass}>
                Refund amount (INR)

                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  className={inputClass}
                  value={
                    amount
                  }
                  max={Math.max(
                    0,
                    remaining -
                      0.01
                  )}
                  onChange={(
                    event
                  ) =>
                    setAmount(
                      event
                        .target
                        .value
                    )
                  }
                />
              </label>
            )}

            <label className={labelClass}>
              Refund reason

              <select
                className={inputClass}
                value={
                  reasonCode
                }
                onChange={(
                  event
                ) =>
                  setReasonCode(
                    event
                      .target
                      .value
                  )
                }
              >
                {reasons.map(
                  ([
                    value,
                    label
                  ]) => (
                    <option
                      value={
                        value
                      }
                      key={
                        value
                      }
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className={labelClass}>
              Internal explanation

              <textarea
                required
                minLength="10"
                maxLength="1000"
                className={`${inputClass} min-h-[110px] resize-y`}
                placeholder="Explain why this refund is being approved…"
                value={
                  reason
                }
                onChange={(
                  event
                ) =>
                  setReason(
                    event
                      .target
                      .value
                  )
                }
              />
            </label>

            <div className="border border-[#ddd0c1] bg-[#f7f0e7] p-4 text-[11px] leading-6 text-[#66574f]">
              Requested refund:{' '}

              <strong>
                {formatCurrency(
                  selectedAmount
                )}
              </strong>

              <br />

              Full refund cancels the related active membership after Razorpay confirms the refund. Partial refund keeps the membership active.
            </div>

            <div className="flex gap-3 max-[600px]:flex-col">
              <button
                className={primaryButtonClass}
                disabled={
                  loading
                }
              >
                {loading
                  ? 'Submitting refund…'
                  : 'Confirm refund'}
              </button>
            </div>
          </form>
        )}

        <section className="mt-8 border-t border-[#ddd0c1] pt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium text-[#2c1a18]">
              Refund history
            </h3>

            <button
              type="button"
              className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#681d25]"
              disabled={
                historyLoading
              }
              onClick={
                loadHistory
              }
            >
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <p className="mt-3 text-[11px] text-[#756a60]">
              Loading refund history…
            </p>
          ) : !history.length ? (
            <p className="mt-3 text-[11px] text-[#756a60]">
              No previous refund requests.
            </p>
          ) : (
            <div className="mt-3">
              {history.map(
                (
                  refund
                ) => (
                  <div
                    key={
                      refund._id
                    }
                    className="border-t border-[#ddd0c1] py-4 first:border-t-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="block text-[11px]">
                          {refund.type}{' '}
                          ·{' '}
                          {formatCurrency(
                            refund.amountPaise /
                              100
                          )}
                        </strong>

                        <small className="mt-1 block text-[9px] leading-5 text-[#756a60]">
                          {refund.reason}
                        </small>

                        {refund
                          .providerRefundId && (
                          <small className="mt-1 block break-all text-[9px] text-[#756a60]">
                            Razorpay:{' '}
                            {refund.providerRefundId}
                          </small>
                        )}
                      </div>

                      <span className="text-[10px] font-extrabold uppercase text-[#681d25]">
                        {refund.status}
                      </span>
                    </div>

                    <small className="mt-2 block text-[9px] text-[#756a60]">
                      {refund
                        .requestedBy
                        ?.email ||
                        'Admin'}{' '}
                      ·{' '}
                      {formatDate(
                        refund.createdAt
                      )}
                    </small>

                    {refund
                      .processedAt && (
                      <small className="mt-1 block text-[9px] text-[#756a60]">
                        Processed:{' '}
                        {formatDate(
                          refund.processedAt
                        )}
                      </small>
                    )}

                    {refund.failureMessage && (
                      <small className="mt-1 block text-[9px] text-[#a22b34]">
                        {refund.failureMessage}
                      </small>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <div className="mt-7 border-t border-[#ddd0c1] pt-5">
          <button
            type="button"
            className={outlineButtonClass}
            disabled={
              loading ||
              syncing
            }
            onClick={
              onClose
            }
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}