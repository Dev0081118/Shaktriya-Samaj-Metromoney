import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  RefreshCw,
  RotateCw
} from 'lucide-react';

import AdminNav from '../../components/AdminNav';

import {
  useToast
} from '../../context/ToastContext';

import {
  api
} from '../../services/api';

import {
  formatCurrency
} from '../../utils/formatters';

const ranges = [
  [
    '7d',
    '7 days'
  ],

  [
    '30d',
    '30 days'
  ],

  [
    '90d',
    '90 days'
  ],

  [
    'this_year',
    'This year'
  ]
];

const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[99px] border border-[#cbb8a4] bg-[#fffdf8] px-5 text-[11px] font-extrabold text-[#431318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

const metricClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const money = (
  value
) =>
  formatCurrency(
    Number(
      value ||
        0
    )
  );

export default function RevenuePage() {
  const [
    range,
    setRange
  ] =
    useState(
      '30d'
    );

  const [
    data,
    setData
  ] =
    useState(null);

  const [
    error,
    setError
  ] =
    useState('');

  const [
    refreshing,
    setRefreshing
  ] =
    useState(false);

  const [
    syncing,
    setSyncing
  ] =
    useState(false);

  const notify =
    useToast();

  const endpoint =
    `/admin/analytics/revenue?range=${range}`;

  const reload =
    useCallback(
      async () => {
        setRefreshing(
          true
        );

        setError('');

        try {
          const response =
            await api(
              endpoint
            );

          setData(
            response.data
          );
        } catch (
          requestError
        ) {
          setError(
            requestError.message
          );
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        endpoint
      ]
    );

  useEffect(
    () => {
      let active =
        true;

      api(
        endpoint
      )
        .then(
          (
            response
          ) => {
            if (!active) {
              return;
            }

            setData(
              response.data
            );

            setError(
              ''
            );
          }
        )
        .catch(
          (
            requestError
          ) => {
            if (!active) {
              return;
            }

            setError(
              requestError.message
            );
          }
        );

      return () => {
        active =
          false;
      };
    },
    [
      endpoint
    ]
  );

  const syncRazorpay =
    async () => {
      setSyncing(
        true
      );

      try {
        const result =
          await api(
            '/admin/analytics/revenue/sync',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  range,

                  limit:
                    100
                })
            }
          );

        setData(
          result
            .data
            .summary
        );

        const {
          synced,
          failed,
          remaining
        } =
          result.data;

        notify(
          failed
            ? `${synced} payments synced, ${failed} failed.`
            : `${synced} Razorpay payments reconciled.`
        );

        if (
          remaining >
          0
        ) {
          notify(
            `${remaining} additional payments remain. Run sync again.`,
            'info'
          );
        }
      } catch (
        syncError
      ) {
        notify(
          syncError.message,
          'error'
        );
      } finally {
        setSyncing(
          false
        );
      }
    };

  const handleRangeChange =
    (
      event
    ) => {
      setData(
        null
      );

      setError('');

      setRange(
        event
          .target
          .value
      );
    };

  const maximum =
    Math.max(
      1,

      ...(
        data?.daily ||
        []
      ).map(
        (
          item
        ) =>
          Math.max(
            0,
            item.gross
          )
      )
    );

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <header className="mb-[30px] flex items-end justify-between gap-5 max-[850px]:flex-col max-[850px]:items-start">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              Business analytics
            </p>

            <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
              Revenue
            </h1>

            <p className="mt-[18px] max-w-[720px] text-[13px] leading-[1.8] text-[#756a60]">
              Gross collections,
              processed refunds and
              Razorpay charges are
              reported separately so
              revenue is not confused
              with profit or bank
              settlement.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={
                buttonClass
              }
              disabled={
                refreshing
              }
              onClick={
                reload
              }
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />

              Refresh
            </button>

            <button
              type="button"
              className={
                buttonClass
              }
              disabled={
                syncing
              }
              onClick={
                syncRazorpay
              }
            >
              <RotateCw
                size={14}
                className={
                  syncing
                    ? 'animate-spin'
                    : ''
                }
              />

              {syncing
                ? 'Syncing…'
                : 'Sync Razorpay'}
            </button>
          </div>
        </header>

        <div className="my-6 flex gap-3 max-[767px]:flex-col">
          <select
            value={
              range
            }
            onChange={
              handleRangeChange
            }
            className="border border-[#ddd0c1] bg-[#fffdf8] p-[13px] font-[inherit]"
          >
            {ranges.map(
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
                  {
                    label
                  }
                </option>
              )
            )}
          </select>
        </div>

        {error &&
        !data ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
              {
                error
              }
            </p>
          </div>
        ) : !data ? (
          <div className="grid min-h-[260px] place-items-center bg-[linear-gradient(100deg,#eee4d8_30%,#f8f3ec_50%,#eee4d8_70%)] bg-[length:300%_100%] font-['Cormorant_Garamond'] text-[24px] font-medium text-[#756a60]">
            Calculating revenue…
          </div>
        ) : (
          <>
            {data
              .reconciliation
              ?.unsyncedPayments >
              0 && (
              <div className="mb-6 border border-[#c49b70] bg-[#c49b7010] p-4 text-[11px] leading-6 text-[#6d4e2f]">
                {
                  data
                    .reconciliation
                    .unsyncedPayments
                }{' '}
                Razorpay payment(s)
                in this period have
                not yet been
                reconciled for
                provider fees.
                Gateway net revenue
                may therefore be
                understated or
                incomplete until
                Razorpay Sync is run.
              </div>
            )}

            <div className="grid grid-cols-3 gap-[15px] max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
              <article
                className={
                  metricClass
                }
              >
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.grossCaptured
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Gross captured
                </span>
              </article>

              <article
                className={
                  metricClass
                }
              >
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium text-[#681d25]">
                  {money(
                    data.totalRefunded
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Processed refunds
                </span>
              </article>

              <article
                className={
                  metricClass
                }
              >
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.customerNet
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Customer net
                </span>
              </article>

              <article
                className={
                  metricClass
                }
              >
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.gatewayFee
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Razorpay charge
                  including GST
                </span>
              </article>

              <article
                className={
                  metricClass
                }
              >
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.gatewayTax
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  GST portion of
                  gateway charge
                </span>
              </article>

              <article className="border border-[#aa7a42] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium text-[#431318]">
                  {money(
                    data.estimatedNetAfterGateway
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Estimated net after
                  Razorpay fee
                </span>
              </article>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-[12px] max-[800px]:grid-cols-2">
              {[
                [
                  data.paymentCount,
                  'Captured payments'
                ],

                [
                  data.refundCount,
                  'Processed refunds'
                ],

                [
                  data.failedCount,
                  'Failed payments'
                ],

                [
                  `${data.reconciliation?.syncedPayments || 0}/${data.reconciliation?.razorpayPayments || 0}`,
                  'Razorpay reconciled'
                ]
              ].map(
                ([
                  value,
                  label
                ]) => (
                  <article
                    key={
                      label
                    }
                    className="border border-[#ddd0c1] bg-[#fffdf8] p-4"
                  >
                    <strong className="block text-[20px]">
                      {
                        value
                      }
                    </strong>

                    <span className="text-[8px] uppercase text-[#756a60]">
                      {
                        label
                      }
                    </span>
                  </article>
                )
              )}
            </div>

            <section className="mt-6 border border-[#ddd0c1] bg-[#fffdf8] p-6">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                  Captured revenue
                  over time
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                  Bar height
                  represents gross
                  captured amount.
                  Hover each day to
                  see refunds and net
                  collection.
                </p>
              </div>

              <div className="flex h-[260px] items-end gap-[5px] overflow-x-auto border-b border-[#ddd0c1] pt-5">
                {data.daily.map(
                  (
                    point
                  ) => (
                    <div
                      key={
                        point.date
                      }
                      title={`${point.date}
Gross: ${money(
                        point.gross
                      )}
Refunded: ${money(
                        point.refunded
                      )}
Net: ${money(
                        point.net
                      )}
Gateway fee: ${money(
                        point.gatewayFee
                      )}`}
                      className="flex h-full min-w-[20px] flex-1 flex-col items-center justify-end gap-[5px]"
                    >
                      <span
                        className="min-h-[4px] w-full max-w-[30px] bg-[linear-gradient(#8d2638,#4b1520)]"
                        style={{
                          height:
                            `${Math.max(
                              4,

                              (
                                point.gross /
                                maximum
                              ) *
                                100
                            )}%`
                        }}
                      />

                      <small className="-mb-4 rotate-[-45deg] text-[7px] text-[#756a60]">
                        {point.date.slice(
                          5
                        )}
                      </small>
                    </div>
                  )
                )}
              </div>

              {!data.daily
                .length && (
                <p className="p-[25px] text-[12px] text-[#756a60]">
                  No captured
                  payments in this
                  period.
                </p>
              )}
            </section>

            <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
              <div className="py-6">
                <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                  Revenue by plan
                </h2>
              </div>

              {data
                .revenueByPlan
                .length ? (
                data
                  .revenueByPlan
                  .map(
                    (
                      row
                    ) => (
                      <div
                        key={
                          row.plan
                        }
                        className="grid grid-cols-[1fr_repeat(4,auto)] items-center gap-[20px] border-t border-[#ddd0c1] py-4 max-[900px]:grid-cols-2"
                      >
                        <div>
                          <strong className="block text-[12px]">
                            {
                              row.plan
                            }
                          </strong>

                          <small className="block text-[9px] text-[#756a60]">
                            {
                              row.capturedCount
                            }{' '}
                            captures
                            {' · '}
                            {
                              row.refundCount
                            }{' '}
                            refunds
                          </small>
                        </div>

                        <div>
                          <small className="block text-[8px] uppercase text-[#756a60]">
                            Gross
                          </small>

                          <strong>
                            {money(
                              row.gross
                            )}
                          </strong>
                        </div>

                        <div>
                          <small className="block text-[8px] uppercase text-[#756a60]">
                            Refunded
                          </small>

                          <strong>
                            {money(
                              row.refunded
                            )}
                          </strong>
                        </div>

                        <div>
                          <small className="block text-[8px] uppercase text-[#756a60]">
                            Gateway
                          </small>

                          <strong>
                            {money(
                              row.gatewayFee
                            )}
                          </strong>
                        </div>

                        <div>
                          <small className="block text-[8px] uppercase text-[#756a60]">
                            Estimated net
                          </small>

                          <strong>
                            {money(
                              row.estimatedNetAfterGateway
                            )}
                          </strong>
                        </div>
                      </div>
                    )
                  )
              ) : (
                <p className="p-[25px] text-[12px] text-[#756a60]">
                  No revenue by plan
                  for this period.
                </p>
              )}
            </section>

            <section className="mt-6 border border-[#ddd0c1] bg-[#fffdf8] p-5">
              <p className="text-[10px] leading-6 text-[#756a60]">
                <strong className="text-[#431318]">
                  Accounting note:
                </strong>{' '}
                Customer net =
                captured collections
                minus processed
                refunds. Estimated
                net after Razorpay =
                customer net minus
                Razorpay fee. The GST
                value displayed above
                is already included
                inside Razorpay's fee,
                so it is not deducted
                twice. Final bank
                settlement can still
                differ because of
                settlement timing,
                credits, adjustments
                or other provider
                deductions.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}