import { useEffect, useState } from 'react';

import AdminNav from '../../components/AdminNav';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const money = (value) =>
  formatCurrency(value);

const ranges = [
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['this_year', 'This year']
];

export default function RevenuePage() {
  const [range, setRange] =
    useState('30d');

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  useEffect(() => {
    api(
      `/admin/analytics/revenue?range=${range}`
    )
      .then((response) =>
        setData(response.data)
      )
      .catch(
        (requestError) =>
          setError(
            requestError.message
          )
      );
  }, [range]);

  const maximum = Math.max(
    1,
    ...(data?.daily || []).map(
      (item) => item.amount
    )
  );

  const handleRangeChange = (
    event
  ) => {
    setError('');
    setData(null);
    setRange(
      event.target.value
    );
  };

  return (
    <div className="admin-shell">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <header className="mb-[30px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            Business analytics
          </p>

          <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
            Revenue
          </h1>

          <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
            Verified captured
            collections—not profit.
          </p>
        </header>

        <div className="my-6 flex gap-3 max-[767px]:flex-col">
          <select
            value={range}
            onChange={
              handleRangeChange
            }
            className="border border-[#ddd0c1] bg-[#fffdf8] p-[13px] font-[inherit]"
          >
            {ranges.map(
              ([value, label]) => (
                <option
                  value={value}
                  key={value}
                >
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        {error ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
              {error}
            </p>
          </div>
        ) : !data ? (
          <div className="grid min-h-[260px] place-items-center bg-[linear-gradient(100deg,#eee4d8_30%,#f8f3ec_50%,#eee4d8_70%)] bg-[length:300%_100%] font-['Cormorant_Garamond'] text-[24px] font-medium text-[#756a60]">
            Calculating captured
            revenue…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-2">
              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.totalCaptured
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Captured revenue
                </span>
              </article>

              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.totalRefunded
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Refunded
                </span>
              </article>

              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {money(
                    data.netCaptured
                  )}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Net captured revenue
                </span>
              </article>

              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {data.paymentCount}
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Successful payments
                </span>
              </article>
            </div>

            <section className="mt-6 border border-[#ddd0c1] bg-[#fffdf8] p-6">
              <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                Revenue over time
              </h2>

              <div className="flex h-[240px] items-end gap-[5px] overflow-x-auto border-b border-[#ddd0c1] pt-5">
                {data.daily.map(
                  (point) => (
                    <div
                      key={point.date}
                      title={`${point.date}: ${money(
                        point.amount
                      )}`}
                      className="flex h-full min-w-[18px] flex-1 flex-col items-center justify-end gap-[5px]"
                    >
                      <span
                        className="min-h-[4px] w-full max-w-[30px] bg-[linear-gradient(#8d2638,#4b1520)]"
                        style={{
                          height: `${Math.max(
                            4,
                            (point.amount /
                              maximum) *
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

              {!data.daily.length && (
                <p className="p-[25px] text-[12px] text-[#756a60]">
                  No captured payments
                  in this period.
                </p>
              )}
            </section>

            <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
              <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                Revenue by plan
              </h2>

              {data.revenueByPlan.map(
                (row) => (
                  <div
                    key={row.plan}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[auto_1fr_auto]"
                  >
                    <div>
                      <strong className="block text-[11px]">
                        {row.plan}
                      </strong>

                      <small className="block text-[9px] text-[#756a60]">
                        {row.count}{' '}
                        payments
                      </small>
                    </div>

                    <span className="col-start-4 max-[767px]:col-start-3">
                      {money(
                        row.amount
                      )}
                    </span>
                  </div>
                )
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}