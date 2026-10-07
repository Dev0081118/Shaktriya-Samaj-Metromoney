/* eslint-disable react-hooks/exhaustive-deps */

import {
  useEffect,
  useState
} from 'react';

import AdminNav from '../../components/AdminNav';
import RefundPaymentModal from '../../components/admin/RefundPaymentModal';

import {
  useToast
} from '../../context/ToastContext';

import {
  api
} from '../../services/api';

import {
  formatCurrency,
  formatDate
} from '../../utils/formatters';

const emptyPlan = {
  name: '',
  slug: '',
  price: 0,
  durationDays: 90,
  active: true,

  features: {
    interestLimit: 0,
    contactViewLimit: 0,
    messageLimit: 0,
    advancedSearch: false,
    profileBoost: false,
    prioritySupport: false,
    relationshipManager: false
  }
};

const paths = {
  support: '/admin/support',
  plans: '/admin/plans',
  payments: '/admin/payments',
  settings: '/admin/settings',
  audit: '/admin/audit-logs',
  health: '/admin/system-health'
};

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55";

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const inputClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const checkboxLabelClass =
  "flex flex-row items-center gap-2 text-[11px] font-extrabold text-[#5e4e46] normal-case tracking-normal";

const adminTableClass =
  "mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]";

const adminRowClass =
  "grid grid-cols-[1fr_auto_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[1fr_auto]";

const reportRowClass =
  "grid grid-cols-[1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4";

const metricClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const metricValueClass =
  "block font-['Cormorant_Garamond'] text-[34px] font-medium";

const metricLabelClass =
  "text-[9px] uppercase text-[#756a60]";

function PageHeader({
  children
}) {
  return (
    <header className="mb-[30px]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
        Operations
      </p>

      <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
        {children}
      </h1>
    </header>
  );
}

export default function AdminOperationsPage({
  type
}) {
  const [
    data,
    setData
  ] = useState(null);

  const [
    error,
    setError
  ] = useState('');

  const [
    editing,
    setEditing
  ] = useState(emptyPlan);

  const [
    refundingPayment,
    setRefundingPayment
  ] = useState(null);

  const notify =
    useToast();

  const load = () =>
    api(
      paths[type]
    )
      .then(
        (
          result
        ) => {
          setData(
            result.data
          );

          setError(
            ''
          );
        }
      )
      .catch(
        (
          caught
        ) => {
          setError(
            caught.message
          );
        }
      );

  useEffect(
    () => {
      load();
    },
    [
      type
    ]
  );

  const updateTicket =
    async (
      ticket,
      status
    ) => {
      try {
        const result =
          await api(
            `/admin/support/${ticket._id}`,
            {
              method: 'PATCH',

              body:
                JSON.stringify({
                  status
                })
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            tickets:
              current.tickets.map(
                (
                  item
                ) =>
                  item._id ===
                  ticket._id
                    ? result.data.ticket
                    : item
              )
          })
        );

        notify(
          'Support ticket updated.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      }
    };

  const saveSettings =
    async (
      event
    ) => {
      event.preventDefault();

      const form =
        Object.fromEntries(
          new FormData(
            event.currentTarget
          )
        );

      for (
        const key
        of [
          'maintenanceMode',
          'registrationEnabled',
          'paymentsEnabled'
        ]
      ) {
        form[key] =
          event
            .currentTarget
            .elements[
              key
            ]
            .checked;
      }

      form.maxPhotos =
        Number(
          form.maxPhotos
        );

      try {
        const result =
          await api(
            '/admin/settings',
            {
              method: 'PATCH',

              body:
                JSON.stringify(
                  form
                )
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            settings:
              result
                .data
                .settings
          })
        );

        notify(
          'System settings saved.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      }
    };

  const savePlan =
    async (
      event
    ) => {
      event.preventDefault();

      try {
        const path =
          editing._id
            ? `/admin/plans/${editing._id}`
            : '/admin/plans';

        const method =
          editing._id
            ? 'PATCH'
            : 'POST';

        await api(
          path,
          {
            method,

            body:
              JSON.stringify(
                editing
              )
          }
        );

        setEditing(
          emptyPlan
        );

        await load();

        notify(
          'Plan saved. Existing subscriptions keep their entitlement snapshot.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      }
    };

  const planField =
    (
      key,
      value
    ) => {
      setEditing(
        (
          current
        ) => ({
          ...current,

          [
            key
          ]:
            value
        })
      );
    };

  const feature =
    (
      key,
      value
    ) => {
      setEditing(
        (
          current
        ) => ({
          ...current,

          features: {
            ...current.features,

            [
              key
            ]:
              value
          }
        })
      );
    };

  const pageTitle =
    type ===
      'audit'
      ? 'Audit logs'
      : type ===
          'health'
        ? 'System health'
        : type[0].toUpperCase() +
          type.slice(
            1
          );

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        {error ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
              {error}
            </p>
          </div>
        ) : !data ? (
          <div className="page-skeleton">
            Loading administration data…
          </div>
        ) : (
          <>
            <PageHeader>
              {pageTitle}
            </PageHeader>

            {type ===
              'support' && (
              <section className={adminTableClass}>
                {data.tickets.map(
                  (
                    ticket
                  ) => (
                    <div
                      className={reportRowClass}
                      key={
                        ticket._id
                      }
                    >
                      <div>
                        <strong className="block text-[11px]">
                          {ticket.priority ===
                          'Priority'
                            ? 'Priority · '
                            : ''}

                          {ticket.category}:{' '}
                          {ticket.name}
                        </strong>

                        <small className="block text-[9px] text-[#756a60]">
                          {ticket.email}{' '}
                          ·{' '}
                          {ticket.message}
                        </small>
                      </div>

                      <time className="text-[9px] text-[#756a60]">
                        {formatDate(
                          ticket.createdAt
                        )}
                      </time>

                      <select
                        className="border border-[#ddd0c1] bg-white p-[10px]"
                        value={
                          ticket.status
                        }
                        onChange={(
                          event
                        ) =>
                          updateTicket(
                            ticket,
                            event
                              .target
                              .value
                          )
                        }
                      >
                        {[
                          'Open',
                          'In Progress',
                          'Resolved',
                          'Closed'
                        ].map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )
                )}
              </section>
            )}

            {type ===
              'plans' && (
              <>
                <form
                  className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px]"
                  onSubmit={
                    savePlan
                  }
                >
                  <h2 className="font-['Cormorant_Garamond'] text-[35px] font-medium">
                    {editing._id
                      ? 'Edit plan'
                      : 'Create plan'}
                  </h2>

                  {[
                    [
                      'name',
                      'Name'
                    ],

                    [
                      'slug',
                      'Slug'
                    ],

                    [
                      'price',
                      'Price (INR)'
                    ],

                    [
                      'durationDays',
                      'Duration (days)'
                    ]
                  ].map(
                    ([
                      key,
                      label
                    ]) => (
                      <label
                        className={labelClass}
                        key={
                          key
                        }
                      >
                        {label}

                        <input
                          required
                          className={inputClass}
                          name={
                            key
                          }
                          type={
                            [
                              'price',
                              'durationDays'
                            ].includes(
                              key
                            )
                              ? 'number'
                              : 'text'
                          }
                          value={
                            editing[
                              key
                            ]
                          }
                          onChange={(
                            event
                          ) =>
                            planField(
                              key,

                              [
                                'price',
                                'durationDays'
                              ].includes(
                                key
                              )
                                ? Number(
                                    event
                                      .target
                                      .value
                                  )
                                : event
                                    .target
                                    .value
                            )
                          }
                        />
                      </label>
                    )
                  )}

                  {[
                    'interestLimit',
                    'contactViewLimit',
                    'messageLimit'
                  ].map(
                    (
                      key
                    ) => (
                      <label
                        className={labelClass}
                        key={
                          key
                        }
                      >
                        {key}

                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={
                            editing
                              .features[
                                key
                              ]
                          }
                          onChange={(
                            event
                          ) =>
                            feature(
                              key,

                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </label>
                    )
                  )}

                  {[
                    'advancedSearch',
                    'profileBoost',
                    'prioritySupport',
                    'relationshipManager'
                  ].map(
                    (
                      key
                    ) => (
                      <label
                        className={checkboxLabelClass}
                        key={
                          key
                        }
                      >
                        <input
                          type="checkbox"
                          className="w-auto"
                          checked={
                            editing
                              .features[
                                key
                              ]
                          }
                          onChange={(
                            event
                          ) =>
                            feature(
                              key,

                              event
                                .target
                                .checked
                            )
                          }
                        />

                        {key}
                      </label>
                    )
                  )}

                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      className="w-auto"
                      checked={
                        editing.active
                      }
                      onChange={(
                        event
                      ) =>
                        planField(
                          'active',

                          event
                            .target
                            .checked
                        )
                      }
                    />

                    Active
                  </label>

                  <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
                    <button className={primaryButtonClass}>
                      Save plan
                    </button>

                    {editing._id && (
                      <button
                        type="button"
                        className={outlineButtonClass}
                        onClick={() =>
                          setEditing(
                            emptyPlan
                          )
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <section className={adminTableClass}>
                  {data.plans.map(
                    (
                      plan
                    ) => (
                      <div
                        className={adminRowClass}
                        key={
                          plan._id
                        }
                      >
                        <div>
                          <strong className="block text-[11px]">
                            {plan.name}
                          </strong>

                          <small className="block text-[9px] text-[#756a60]">
                            {plan.durationDays}{' '}
                            days ·{' '}
                            {plan.active
                              ? 'Active'
                              : 'Inactive'}
                          </small>
                        </div>

                        <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                          {formatCurrency(
                            plan.price
                          )}
                        </time>

                        <button
                          type="button"
                          className={outlineButtonClass}
                          onClick={() =>
                            setEditing({
                              ...plan,

                              features: {
                                ...emptyPlan.features,

                                ...plan.features
                              }
                            })
                          }
                        >
                          Edit
                        </button>
                      </div>
                    )
                  )}
                </section>
              </>
            )}

            {type ===
              'payments' && (
              <>
                <section className={adminTableClass}>
                  {data.payments.map(
                    (
                      payment
                    ) => {
                      const refunded =
                        Number(
                          payment
                            .refundedAmountPaise ||
                            0
                        ) /
                        100;

                      const pending =
                        Number(
                          payment
                            .refundPendingPaise ||
                            0
                        ) /
                        100;

                      const canOpenRefund =
                        payment.provider ===
                          'razorpay' &&
                        Boolean(
                          payment
                            .providerPaymentId
                        ) &&
                        (
                          payment.status ===
                            'Paid' ||
                          payment.status ===
                            'Refunded'
                        );

                      const canCreateRefund =
                        payment.status ===
                          'Paid' &&
                        pending ===
                          0 &&
                        refunded <
                          Number(
                            payment.amount
                          );

                      return (
                        <div
                          className={adminRowClass}
                          key={
                            payment._id
                          }
                        >
                          <div className="min-w-0">
                            <strong className="block break-all text-[11px]">
                              {payment
                                .user
                                ?.email ||
                                'Member'}
                            </strong>

                            <small className="block break-all text-[9px] leading-5 text-[#756a60]">
                              {payment.providerOrderId ||
                                'No order'}{' '}
                              ·{' '}
                              {payment
                                .plan
                                ?.name ||
                                'Plan'}
                            </small>

                            {refunded >
                              0 && (
                              <small className="block text-[9px] text-[#91683f]">
                                Refunded{' '}
                                {formatCurrency(
                                  refunded
                                )}
                              </small>
                            )}

                            {pending >
                              0 && (
                              <small className="block text-[9px] font-bold text-[#91683f]">
                                Refund pending{' '}
                                {formatCurrency(
                                  pending
                                )}
                              </small>
                            )}
                          </div>

                          <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                            {payment.status}
                          </time>

                          <span className="text-[11px]">
                            {formatCurrency(
                              payment.amount
                            )}
                          </span>

                          <button
                            type="button"
                            className={outlineButtonClass}
                            disabled={
                              !canOpenRefund
                            }
                            onClick={() =>
                              setRefundingPayment(
                                payment
                              )
                            }
                          >
                            {payment.status ===
                            'Refunded'
                              ? 'View refund'
                              : pending >
                                  0
                                ? 'Sync refund'
                                : canCreateRefund
                                  ? 'Refund'
                                  : 'View'}
                          </button>
                        </div>
                      );
                    }
                  )}

                  {!data.payments.length && (
                    <p className="p-[25px] text-[12px] text-[#756a60]">
                      No payments.
                    </p>
                  )}
                </section>

                {refundingPayment && (
                  <RefundPaymentModal
                    payment={
                      refundingPayment
                    }
                    onClose={() =>
                      setRefundingPayment(
                        null
                      )
                    }
                    onSubmitted={
                      async () => {
                        await load();
                      }
                    }
                  />
                )}
              </>
            )}

            {type ===
              'audit' && (
              <section className={adminTableClass}>
                {data.logs.map(
                  (
                    log
                  ) => (
                    <div
                      className={adminRowClass}
                      key={
                        log._id
                      }
                    >
                      <div>
                        <strong className="block text-[11px]">
                          {log.action}
                        </strong>

                        <small className="block text-[9px] text-[#756a60]">
                          {log.actor
                            ?.email ||
                            'System'}{' '}
                          ·{' '}
                          {log.entityType}{' '}
                          {log.entityId}
                        </small>
                      </div>

                      <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                        {formatDate(
                          log.createdAt,

                          undefined,

                          {
                            dateStyle:
                              'medium',

                            timeStyle:
                              'short'
                          }
                        )}
                      </time>
                    </div>
                  )
                )}
              </section>
            )}

            {type ===
              'settings' && (
              <>
                <form
                  className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px]"
                  onSubmit={
                    saveSettings
                  }
                >
                  {[
                    [
                      'platformName',
                      'Platform name'
                    ],

                    [
                      'supportEmail',
                      'Support email'
                    ],

                    [
                      'supportPhone',
                      'Support phone'
                    ],

                    [
                      'defaultCountry',
                      'Default country'
                    ],

                    [
                      'maxPhotos',
                      'Maximum photos'
                    ]
                  ].map(
                    ([
                      key,
                      label
                    ]) => (
                      <label
                        className={labelClass}
                        key={
                          key
                        }
                      >
                        {label}

                        <input
                          className={inputClass}
                          name={
                            key
                          }
                          type={
                            key ===
                            'maxPhotos'
                              ? 'number'
                              : 'text'
                          }
                          defaultValue={
                            data
                              .settings[
                                key
                              ] ||
                            ''
                          }
                        />
                      </label>
                    )
                  )}

                  {[
                    [
                      'maintenanceMode',
                      'Maintenance mode'
                    ],

                    [
                      'registrationEnabled',
                      'Registration enabled'
                    ],

                    [
                      'paymentsEnabled',
                      'Payments enabled'
                    ]
                  ].map(
                    ([
                      key,
                      label
                    ]) => (
                      <label
                        className={checkboxLabelClass}
                        key={
                          key
                        }
                      >
                        <input
                          className="w-auto"
                          name={
                            key
                          }
                          type="checkbox"
                          defaultChecked={
                            data
                              .settings[
                                key
                              ]
                          }
                        />

                        {label}
                      </label>
                    )
                  )}

                  <button className={primaryButtonClass}>
                    Save settings
                  </button>
                </form>

                {data.providers && (
                  <section className={adminTableClass}>
                    <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                      Provider readiness
                    </h2>

                    {Object.entries(
                      data.providers
                    ).map(
                      ([
                        key,
                        provider
                      ]) => (
                        <div
                          className={adminRowClass}
                          key={
                            key
                          }
                        >
                          <strong className="block text-[11px]">
                            {key}:{' '}
                            {provider.name}
                          </strong>

                          <span>
                            {provider.configured
                              ? 'Configured'
                              : `Missing ${provider.missing.join(
                                  ', '
                                )}`}
                          </span>
                        </div>
                      )
                    )}
                  </section>
                )}
              </>
            )}

            {type ===
              'health' && (
              <>
                <div className="grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-2">
                  <article className={metricClass}>
                    <strong className={metricValueClass}>
                      {data.api.status}
                    </strong>

                    <span className={metricLabelClass}>
                      API ·{' '}
                      {data.api.environment}
                    </span>
                  </article>

                  <article className={metricClass}>
                    <strong className={metricValueClass}>
                      {data.database.status}
                    </strong>

                    <span className={metricLabelClass}>
                      MongoDB
                    </span>
                  </article>

                  <article className={metricClass}>
                    <strong className={metricValueClass}>
                      {Math.floor(
                        data.api
                          .uptimeSeconds /
                          60
                      )}
                      m
                    </strong>

                    <span className={metricLabelClass}>
                      API uptime
                    </span>
                  </article>
                </div>

                <section className={adminTableClass}>
                  <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                    Provider readiness
                  </h2>

                  {Object.entries(
                    data.providers
                  ).map(
                    ([
                      key,
                      provider
                    ]) => (
                      <div
                        className={adminRowClass}
                        key={
                          key
                        }
                      >
                        <div>
                          <strong className="block text-[11px]">
                            {provider.name}
                          </strong>

                          <small className="block text-[9px] text-[#756a60]">
                            {key}
                          </small>
                        </div>

                        <span className="rounded-[99px] border border-[#8d6e45] px-[9px] py-[5px] text-[9px] uppercase text-[#694c26]">
                          {provider.status}
                        </span>
                      </div>
                    )
                  )}
                </section>

                <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] p-6">
                  <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                    Operational switches
                  </h2>

                  <div className="grid gap-3">
                    {Object.entries(
                      data.platform
                    ).map(
                      ([
                        key,
                        value
                      ]) => (
                        <span
                          key={
                            key
                          }
                          className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-2"
                        >
                          {key}

                          <strong>
                            {value
                              ? 'Enabled'
                              : 'Disabled'}
                          </strong>
                        </span>
                      )
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}