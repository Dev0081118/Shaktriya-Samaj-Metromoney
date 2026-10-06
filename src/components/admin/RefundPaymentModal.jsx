import {
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
    useState('full');

  const [
    amount,
    setAmount
  ] =
    useState('');

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
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(false);

  const [
    history,
    setHistory
  ] =
    useState([]);

  const [
    historyLoading,
    setHistoryLoading
  ] =
    useState(true);

  const original =
    Number(
      payment?.amount ||
        0
    );

  const refunded =
    Number(
      payment
        ?.refundedAmountPaise ||
        0
    ) / 100;

  const pending =
    Number(
      payment
        ?.refundPendingPaise ||
        0
    ) / 100;

  const remaining =
    Math.max(
      0,
      original -
        refunded -
        pending
    );

  const canRefund =
    payment?.status ===
      'Paid' &&
    payment?.provider ===
      'razorpay' &&
    Boolean(
      payment
        ?.providerPaymentId
    ) &&
    pending === 0 &&
    remaining > 0;

  const selectedAmount =
    useMemo(
      () =>
        type === 'full'
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

  useEffect(
    () => {
      let active =
        true;

      if (
        !payment?._id
      ) {
        return () => {
          active =
            false;
        };
      }

      api(
        `/admin/payments/${payment._id}/refunds`
      )
        .then(
          (
            response
          ) => {
            if (
              !active
            ) {
              return;
            }

            setHistory(
              response
                .data
                ?.refunds ||
                []
            );
          }
        )
        .catch(
          () => {
            if (
              active
            ) {
              setHistory(
                []
              );
            }
          }
        )
        .finally(
          () => {
            if (
              active
            ) {
              setHistoryLoading(
                false
              );
            }
          }
        );

      return () => {
        active =
          false;
      };
    },

    [
      payment?._id
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
        reason.trim()
          .length < 10
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
          partial <= 0 ||
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
          'Refund submitted to Razorpay. Waiting for provider confirmation.'
        );

        await onSubmitted?.();

        onClose();
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
          {payment
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
                remaining
              )}
            </strong>

            <span className="text-[9px] uppercase text-[#756a60]">
              Remaining
            </span>
          </article>
        </div>

        {pending >
          0 && (
          <div className="mt-5 border border-[#d9b76d] bg-[#fff7df] p-4 text-[12px] leading-6 text-[#6c4b10]">
            A refund of{' '}
            <strong>
              {formatCurrency(
                pending
              )}
            </strong>{' '}
            is waiting for Razorpay confirmation.
          </div>
        )}

        {!canRefund &&
          pending ===
            0 && (
          <div className="mt-5 border border-[#d7b4b4] bg-[#fff3f3] p-4 text-[12px] leading-6 text-[#681d25]">
            This transaction is not currently eligible for an admin refund.
          </div>
        )}

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
              disabled={
                !canRefund
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
                disabled={
                  !canRefund
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
              disabled={
                !canRefund
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
              disabled={
                !canRefund
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

            Full refund cancels the related active membership only after Razorpay confirms the refund. Partial refund keeps the membership active.
          </div>

          <div className="flex gap-3 max-[600px]:flex-col">
            <button
              className={primaryButtonClass}
              disabled={
                loading ||
                !canRefund
              }
            >
              {loading
                ? 'Submitting refund…'
                : 'Confirm refund'}
            </button>

            <button
              type="button"
              className={outlineButtonClass}
              disabled={
                loading
              }
              onClick={
                onClose
              }
            >
              Cancel
            </button>
          </div>
        </form>

        <section className="mt-8 border-t border-[#ddd0c1] pt-6">
          <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium text-[#2c1a18]">
            Refund history
          </h3>

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
      </div>
    </div>
  );
}