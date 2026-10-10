import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  RefreshCw,
  Server,
  ShieldCheck
} from 'lucide-react';

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

const createEmptyPlan = () => ({
  name: '',
  slug: '',
  price: 0,
  durationDays: 30,
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
});

const paths = {
  support:
    '/admin/support',

  plans:
    '/admin/plans',

  payments:
    '/admin/payments',

  settings:
    '/admin/settings',

  audit:
    '/admin/audit-logs',

  health:
    '/admin/system-health'
};

const titles = {
  support:
    'Support',

  plans:
    'Plans',

  payments:
    'Payments',

  settings:
    'System settings',

  audit:
    'Audit logs',

  health:
    'System health'
};

const descriptions = {
  support:
    'Review and resolve member support requests.',

  plans:
    'Manage membership pricing, limits and paid entitlements.',

  payments:
    'Review Razorpay transactions and manage refund workflows.',

  settings:
    'Control platform availability and operational defaults.',

  audit:
    'Review important administrative and security actions.',

  health:
    'Check API, database and provider readiness.'
};

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55";

const dangerButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#b46a70] bg-transparent px-5 text-[12px] font-extrabold text-[#681d25] transition duration-200 hover:bg-[#681d2508] disabled:cursor-not-allowed disabled:opacity-55";

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const inputClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const checkboxLabelClass =
  "flex flex-row items-center gap-2 text-[11px] font-extrabold text-[#5e4e46] normal-case tracking-normal";

const adminTableClass =
  "mt-8 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]";

const metricClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const metricValueClass =
  "block font-['Cormorant_Garamond'] text-[34px] font-medium text-[#2c1a18]";

const metricLabelClass =
  "mt-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-[#756a60]";

function PageHeader({
  type,
  refreshing,
  onRefresh
}) {
  return (
    <header className="mb-[30px] flex items-end justify-between gap-5 max-[767px]:items-start">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Operations
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          {titles[type]}
        </h1>

        <p className="mt-4 max-w-[680px] text-[13px] leading-7 text-[#756a60]">
          {descriptions[type]}
        </p>
      </div>

      <button
        type="button"
        className={outlineButtonClass}
        disabled={refreshing}
        onClick={onRefresh}
      >
        <RefreshCw
          size={15}
          className={
            refreshing
              ? 'animate-spin'
              : ''
          }
        />

        Refresh
      </button>
    </header>
  );
}

function EmptyState({
  children
}) {
  return (
    <div className="border-t border-[#ddd0c1] px-4 py-12 text-center text-[12px] text-[#756a60]">
      {children}
    </div>
  );
}

function StatusBadge({
  status
}) {
  const normalized =
    String(
      status ||
        ''
    ).toLowerCase();

  const positive =
    [
      'paid',
      'processed',
      'active',
      'available',
      'configured',
      'resolved',
      'closed'
    ].includes(
      normalized
    );

  const warning =
    [
      'pending',
      'submitted',
      'requested',
      'processing',
      'in progress',
      'open'
    ].includes(
      normalized
    );

  return (
    <span
      className={`inline-flex rounded-full border px-[9px] py-[5px] text-[9px] font-bold uppercase ${
        positive
          ? 'border-[#76946f] bg-[#76946f0d] text-[#45643f]'
          : warning
            ? 'border-[#b58a4c] bg-[#b58a4c0d] text-[#75551f]'
            : 'border-[#b46a70] bg-[#681d2508] text-[#681d25]'
      }`}
    >
      {status ||
        'Unknown'}
    </span>
  );
}

export default function AdminOperationsPage({
  type
}) {
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
    busyId,
    setBusyId
  ] =
    useState('');

  const [
    saving,
    setSaving
  ] =
    useState(false);

  const [
    editing,
    setEditing
  ] =
    useState(
      createEmptyPlan
    );

  const [
    refundingPayment,
    setRefundingPayment
  ] =
    useState(null);

  const notify =
    useToast();

  const path =
    paths[type];

  const reload =
    useCallback(
      async () => {
        if (!path) {
          return;
        }

        setRefreshing(
          true
        );

        setError('');

        try {
          const result =
            await api(
              path
            );

          setData(
            result.data
          );
        } catch (
          caught
        ) {
          setError(
            caught.message
          );
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        path
      ]
    );

  useEffect(
    () => {
      if (!path) {
        return undefined;
      }

      let active =
        true;

      api(path)
        .then(
          (
            result
          ) => {
            if (
              !active
            ) {
              return;
            }

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
            if (
              !active
            ) {
              return;
            }

            setError(
              caught.message
            );
          }
        );

      return () => {
        active =
          false;
      };
    },
    [
      path
    ]
  );

  if (!path) {
    return (
      <div className="admin-shell min-h-screen bg-[#f5f0e8]">
        <AdminNav />

        <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            Unknown administration
            section.
          </div>
        </main>
      </div>
    );
  }

  const updateTicket =
    async (
      ticket,
      status
    ) => {
      if (
        status ===
        ticket.status
      ) {
        return;
      }

      setBusyId(
        ticket._id
      );

      try {
        const result =
          await api(
            `/admin/support/${ticket._id}`,
            {
              method:
                'PATCH',

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
                    ? result
                        .data
                        .ticket
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
      } finally {
        setBusyId(
          ''
        );
      }
    };

  const saveSettings =
    async (
      event
    ) => {
      event.preventDefault();

      const target =
        event.currentTarget;

      const form =
        Object.fromEntries(
          new FormData(
            target
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
          target.elements[
            key
          ].checked;
      }

      form.maxPhotos =
        Number(
          form.maxPhotos
        );

      if (
        !Number.isInteger(
          form.maxPhotos
        ) ||
        form.maxPhotos <
          1 ||
        form.maxPhotos >
          20
      ) {
        notify(
          'Maximum photos must be between 1 and 20.',
          'error'
        );

        return;
      }

      if (
        !String(
          form.platformName ||
            ''
        ).trim()
      ) {
        notify(
          'Platform name is required.',
          'error'
        );

        return;
      }

      setSaving(
        true
      );

      try {
        const result =
          await api(
            '/admin/settings',
            {
              method:
                'PATCH',

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
      } finally {
        setSaving(
          false
        );
      }
    };

  const savePlan =
    async (
      event
    ) => {
      event.preventDefault();

      const name =
        editing.name
          .trim();

      const slug =
        editing.slug
          .trim()
          .toLowerCase();

      if (
        !name ||
        !slug
      ) {
        notify(
          'Plan name and slug are required.',
          'error'
        );

        return;
      }

      if (
        !/^[a-z0-9-]+$/.test(
          slug
        )
      ) {
        notify(
          'Plan slug may contain lowercase letters, numbers and hyphens only.',
          'error'
        );

        return;
      }

      if (
        Number(
          editing.price
        ) <
        0
      ) {
        notify(
          'Plan price cannot be negative.',
          'error'
        );

        return;
      }

      if (
        Number(
          editing.durationDays
        ) <=
        0
      ) {
        notify(
          'Plan duration must be greater than zero.',
          'error'
        );

        return;
      }

      setSaving(
        true
      );

      try {
        const requestPath =
          editing._id
            ? `/admin/plans/${editing._id}`
            : '/admin/plans';

        const method =
          editing._id
            ? 'PATCH'
            : 'POST';

        await api(
          requestPath,
          {
            method,

            body:
              JSON.stringify({
                ...editing,

                name,

                slug,

                price:
                  Number(
                    editing.price
                  ),

                durationDays:
                  Number(
                    editing.durationDays
                  )
              })
          }
        );

        setEditing(
          createEmptyPlan()
        );

        await reload();

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
      } finally {
        setSaving(
          false
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

  const startEditingPlan =
    (
      plan
    ) => {
      setEditing({
        ...createEmptyPlan(),

        ...plan,

        features: {
          ...createEmptyPlan()
            .features,

          ...plan.features
        }
      });

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth'
      });
    };

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <PageHeader
          type={type}
          refreshing={
            refreshing
          }
          onRefresh={
            reload
          }
        />

        {error &&
        !data ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            <CircleAlert
              className="mx-auto mb-4 text-[#681d25]"
            />

            <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
              {error}
            </p>

            <button
              type="button"
              className={`${outlineButtonClass} mt-5`}
              onClick={
                reload
              }
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <div className="page-skeleton">
            Loading administration
            data…
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 border border-[#b46a70] bg-[#681d2508] p-4 text-[11px] text-[#681d25]">
                {error}
              </div>
            )}

            {type ===
              'support' && (
              <section
                className={
                  adminTableClass
                }
              >
                <div className="flex items-end justify-between gap-4 py-6">
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                      Support queue
                    </h2>

                    <p className="mt-1 text-[10px] text-[#756a60]">
                      {
                        data
                          .tickets
                          ?.length ||
                        0
                      }{' '}
                      tickets
                    </p>
                  </div>
                </div>

                {data.tickets
                  ?.length ? (
                  data.tickets.map(
                    (
                      ticket
                    ) => (
                      <div
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-1"
                        key={
                          ticket._id
                        }
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="block text-[11px]">
                              {
                                ticket.category
                              }
                              :{' '}
                              {
                                ticket.name
                              }
                            </strong>

                            {ticket.priority ===
                              'Priority' && (
                              <span className="rounded-full border border-[#b58a4c] px-2 py-1 text-[8px] font-bold uppercase text-[#75551f]">
                                Priority
                              </span>
                            )}
                          </div>

                          <small className="mt-1 block break-words text-[9px] leading-5 text-[#756a60]">
                            {
                              ticket.email
                            }
                            {' · '}
                            {
                              ticket.message
                            }
                          </small>
                        </div>

                        <time className="text-[9px] text-[#756a60]">
                          {formatDate(
                            ticket.createdAt
                          )}
                        </time>

                        <select
                          aria-label={`Status for support ticket ${ticket._id}`}
                          className="border border-[#ddd0c1] bg-white p-[10px] text-[11px]"
                          value={
                            ticket.status
                          }
                          disabled={
                            busyId ===
                            ticket._id
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
                                {
                                  option
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )
                  )
                ) : (
                  <EmptyState>
                    No support
                    tickets.
                  </EmptyState>
                )}
              </section>
            )}

            {type ===
              'plans' && (
              <>
                <form
                  className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[767px]:p-5"
                  onSubmit={
                    savePlan
                  }
                  noValidate
                >
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#91683f]">
                      Membership
                      configuration
                    </p>

                    <h2 className="mt-2 font-['Cormorant_Garamond'] text-[35px] font-medium">
                      {editing._id
                        ? 'Edit plan'
                        : 'Create plan'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
                    <label
                      className={
                        labelClass
                      }
                    >
                      Name

                      <input
                        required
                        className={
                          inputClass
                        }
                        value={
                          editing.name
                        }
                        onChange={(
                          event
                        ) =>
                          planField(
                            'name',
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Slug

                      <input
                        required
                        className={
                          inputClass
                        }
                        value={
                          editing.slug
                        }
                        onChange={(
                          event
                        ) =>
                          planField(
                            'slug',
                            event
                              .target
                              .value
                              .toLowerCase()
                          )
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Price (INR)

                      <input
                        required
                        min="0"
                        type="number"
                        className={
                          inputClass
                        }
                        value={
                          editing.price
                        }
                        onChange={(
                          event
                        ) =>
                          planField(
                            'price',
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Duration
                      (days)

                      <input
                        required
                        min="1"
                        type="number"
                        className={
                          inputClass
                        }
                        value={
                          editing.durationDays
                        }
                        onChange={(
                          event
                        ) =>
                          planField(
                            'durationDays',
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-2 border-t border-[#ddd0c1] pt-6">
                    <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium">
                      Usage limits
                    </h3>

                    <div className="mt-4 grid grid-cols-3 gap-[18px] max-[767px]:grid-cols-1">
                      {[
                        [
                          'interestLimit',
                          'Interest limit'
                        ],

                        [
                          'contactViewLimit',
                          'Contact view limit'
                        ],

                        [
                          'messageLimit',
                          'Message limit'
                        ]
                      ].map(
                        ([
                          key,
                          label
                        ]) => (
                          <label
                            className={
                              labelClass
                            }
                            key={
                              key
                            }
                          >
                            {
                              label
                            }

                            <input
                              type="number"
                              min="0"
                              className={
                                inputClass
                              }
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
                    </div>
                  </div>

                  <div className="border-t border-[#ddd0c1] pt-6">
                    <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium">
                      Included features
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-3 max-[767px]:grid-cols-1">
                      {[
                        [
                          'advancedSearch',
                          'Advanced search'
                        ],

                        [
                          'profileBoost',
                          'Profile boost'
                        ],

                        [
                          'prioritySupport',
                          'Priority support'
                        ],

                        [
                          'relationshipManager',
                          'Relationship manager'
                        ]
                      ].map(
                        ([
                          key,
                          label
                        ]) => (
                          <label
                            className={
                              checkboxLabelClass
                            }
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

                            {
                              label
                            }
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <label
                    className={
                      checkboxLabelClass
                    }
                  >
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

                    Plan is active
                  </label>

                  <div className="mt-4 flex flex-wrap gap-[10px]">
                    <button
                      type="submit"
                      className={
                        primaryButtonClass
                      }
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? 'Saving…'
                        : 'Save plan'}
                    </button>

                    {editing._id && (
                      <button
                        type="button"
                        className={
                          outlineButtonClass
                        }
                        disabled={
                          saving
                        }
                        onClick={() =>
                          setEditing(
                            createEmptyPlan()
                          )
                        }
                      >
                        Cancel editing
                      </button>
                    )}
                  </div>
                </form>

                <section
                  className={
                    adminTableClass
                  }
                >
                  <div className="py-6">
                    <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                      Available plans
                    </h2>
                  </div>

                  {data.plans
                    ?.length ? (
                    data.plans.map(
                      (
                        plan
                      ) => (
                        <div
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4 max-[650px]:grid-cols-1"
                          key={
                            plan._id
                          }
                        >
                          <div>
                            <strong className="block text-[12px]">
                              {
                                plan.name
                              }
                            </strong>

                            <small className="mt-1 block text-[9px] text-[#756a60]">
                              {
                                plan.slug
                              }
                              {' · '}
                              {
                                plan.durationDays
                              }{' '}
                              days
                              {' · '}
                              {plan.active
                                ? 'Active'
                                : 'Inactive'}
                            </small>
                          </div>

                          <div className="text-right max-[650px]:text-left">
                            <strong className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                              {formatCurrency(
                                plan.price
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className={
                              outlineButtonClass
                            }
                            onClick={() =>
                              startEditingPlan(
                                plan
                              )
                            }
                          >
                            Edit
                          </button>
                        </div>
                      )
                    )
                  ) : (
                    <EmptyState>
                      No membership
                      plans.
                    </EmptyState>
                  )}
                </section>
              </>
            )}

            {type ===
              'payments' && (
              <>
                <div className="grid grid-cols-4 gap-[15px] max-[900px]:grid-cols-2">
                  {[
                    [
                      data
                        .payments
                        ?.length ||
                        0,

                      'Transactions'
                    ],

                    [
                      (
                        data
                          .payments ||
                        []
                      ).filter(
                        (
                          item
                        ) =>
                          item.status ===
                          'Paid'
                      ).length,

                      'Paid'
                    ],

                    [
                      (
                        data
                          .payments ||
                        []
                      ).filter(
                        (
                          item
                        ) =>
                          Number(
                            item
                              .refundedAmountPaise ||
                              0
                          ) >
                          0
                      ).length,

                      'Refund activity'
                    ],

                    [
                      formatCurrency(
                        (
                          data
                            .payments ||
                          []
                        )
                          .filter(
                            (
                              item
                            ) =>
                              [
                                'Paid',
                                'Refunded'
                              ].includes(
                                item.status
                              )
                          )
                          .reduce(
                            (
                              sum,
                              item
                            ) =>
                              sum +
                              Number(
                                item.amount ||
                                  0
                              ),
                            0
                          )
                      ),

                      'Listed gross'
                    ]
                  ].map(
                    ([
                      value,
                      label
                    ]) => (
                      <article
                        className={
                          metricClass
                        }
                        key={
                          label
                        }
                      >
                        <strong
                          className={
                            metricValueClass
                          }
                        >
                          {
                            value
                          }
                        </strong>

                        <span
                          className={
                            metricLabelClass
                          }
                        >
                          {
                            label
                          }
                        </span>
                      </article>
                    )
                  )}
                </div>

                <section
                  className={
                    adminTableClass
                  }
                >
                  <div className="py-6">
                    <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                      Payment history
                    </h2>
                  </div>

                  {data.payments
                    ?.length ? (
                    data.payments.map(
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

                        const remaining =
                          Math.max(
                            0,

                            Number(
                              payment.amount ||
                                0
                            ) -
                              refunded -
                              pending
                          );

                        const canOpenRefund =
                          payment.provider ===
                            'razorpay' &&
                          Boolean(
                            payment
                              .providerPaymentId
                          ) &&
                          [
                            'Paid',
                            'Refunded'
                          ].includes(
                            payment.status
                          );

                        const canCreateRefund =
                          payment.status ===
                            'Paid' &&
                          pending ===
                            0 &&
                          remaining >
                            0;

                        return (
                          <div
                            className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4 max-[850px]:grid-cols-[1fr_auto] max-[520px]:grid-cols-1"
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

                              <small className="mt-1 block break-all text-[9px] leading-5 text-[#756a60]">
                                {payment
                                  .plan
                                  ?.name ||
                                  'Historical plan'}
                                {' · '}
                                {payment.provider ||
                                  'Unknown provider'}
                                {' · '}
                                {payment.providerPaymentId ||
                                  payment.providerOrderId ||
                                  'No provider reference'}
                              </small>

                              {refunded >
                                0 && (
                                <small className="mt-1 block text-[9px] font-bold text-[#91683f]">
                                  Refunded{' '}
                                  {formatCurrency(
                                    refunded
                                  )}
                                </small>
                              )}

                              {pending >
                                0 && (
                                <small className="mt-1 block text-[9px] font-bold text-[#91683f]">
                                  Refund
                                  pending{' '}
                                  {formatCurrency(
                                    pending
                                  )}
                                </small>
                              )}
                            </div>

                            <StatusBadge
                              status={
                                payment.status
                              }
                            />

                            <div className="text-right max-[520px]:text-left">
                              <strong className="block font-['Cormorant_Garamond'] text-[21px] font-medium">
                                {formatCurrency(
                                  payment.amount
                                )}
                              </strong>

                              {canCreateRefund && (
                                <small className="text-[8px] text-[#756a60]">
                                  Refundable{' '}
                                  {formatCurrency(
                                    remaining
                                  )}
                                </small>
                              )}
                            </div>

                            <button
                              type="button"
                              className={
                                canCreateRefund
                                  ? dangerButtonClass
                                  : outlineButtonClass
                              }
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
                    )
                  ) : (
                    <EmptyState>
                      No payments
                      recorded.
                    </EmptyState>
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
                        setRefundingPayment(
                          null
                        );

                        await reload();
                      }
                    }
                  />
                )}
              </>
            )}

            {type ===
              'audit' && (
              <section
                className={
                  adminTableClass
                }
              >
                <div className="py-6">
                  <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                    Administrative
                    history
                  </h2>
                </div>

                {data.logs
                  ?.length ? (
                  data.logs.map(
                    (
                      log
                    ) => (
                      <div
                        className="grid grid-cols-[1fr_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4 max-[600px]:grid-cols-1"
                        key={
                          log._id
                        }
                      >
                        <div className="min-w-0">
                          <strong className="block text-[11px]">
                            {
                              log.action
                            }
                          </strong>

                          <small className="mt-1 block break-all text-[9px] leading-5 text-[#756a60]">
                            {log.actor
                              ?.email ||
                              'System'}
                            {' · '}
                            {
                              log.entityType
                            }
                            {log.entityId
                              ? ` · ${log.entityId}`
                              : ''}
                          </small>

                          {log.metadata &&
                            Object.keys(
                              log.metadata
                            ).length >
                              0 && (
                              <small className="mt-1 block break-words text-[8px] text-[#91867d]">
                                {JSON.stringify(
                                  log.metadata
                                )}
                              </small>
                            )}
                        </div>

                        <time className="text-[9px] text-[#756a60]">
                          {formatDate(
                            log.createdAt
                          )}
                        </time>
                      </div>
                    )
                  )
                ) : (
                  <EmptyState>
                    No audit events
                    found.
                  </EmptyState>
                )}
              </section>
            )}

            {type ===
              'settings' && (
              <>
                <form
                  className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[767px]:p-5"
                  onSubmit={
                    saveSettings
                  }
                  noValidate
                >
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[32px] font-medium">
                      Platform
                      configuration
                    </h2>

                    <p className="mt-1 text-[11px] text-[#756a60]">
                      Changes apply
                      across the
                      member portal.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
                    <label
                      className={
                        labelClass
                      }
                    >
                      Platform name

                      <input
                        className={
                          inputClass
                        }
                        name="platformName"
                        defaultValue={
                          data
                            .settings
                            ?.platformName ||
                          ''
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Support email

                      <input
                        className={
                          inputClass
                        }
                        type="email"
                        name="supportEmail"
                        defaultValue={
                          data
                            .settings
                            ?.supportEmail ||
                          ''
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Support phone

                      <input
                        className={
                          inputClass
                        }
                        name="supportPhone"
                        defaultValue={
                          data
                            .settings
                            ?.supportPhone ||
                          ''
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Default country

                      <input
                        className={
                          inputClass
                        }
                        name="defaultCountry"
                        defaultValue={
                          data
                            .settings
                            ?.defaultCountry ||
                          ''
                        }
                      />
                    </label>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Maximum photos

                      <input
                        className={
                          inputClass
                        }
                        name="maxPhotos"
                        type="number"
                        defaultValue={
                          data
                            .settings
                            ?.maxPhotos ??
                          5
                        }
                      />
                    </label>
                  </div>

                  <div className="border-t border-[#ddd0c1] pt-6">
                    <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium">
                      Operational
                      switches
                    </h3>

                    <div className="mt-4 grid gap-3">
                      <label
                        className={
                          checkboxLabelClass
                        }
                      >
                        <input
                          className="w-auto"
                          name="maintenanceMode"
                          type="checkbox"
                          defaultChecked={
                            !!data
                              .settings
                              ?.maintenanceMode
                          }
                        />

                        Maintenance
                        mode
                      </label>

                      <label
                        className={
                          checkboxLabelClass
                        }
                      >
                        <input
                          className="w-auto"
                          name="registrationEnabled"
                          type="checkbox"
                          defaultChecked={
                            !!data
                              .settings
                              ?.registrationEnabled
                          }
                        />

                        Registration
                        enabled
                      </label>

                      <label
                        className={
                          checkboxLabelClass
                        }
                      >
                        <input
                          className="w-auto"
                          name="paymentsEnabled"
                          type="checkbox"
                          defaultChecked={
                            !!data
                              .settings
                              ?.paymentsEnabled
                          }
                        />

                        Payments
                        enabled
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={
                      primaryButtonClass
                    }
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? 'Saving…'
                      : 'Save settings'}
                  </button>
                </form>

                {data.providers && (
                  <section
                    className={
                      adminTableClass
                    }
                  >
                    <div className="py-6">
                      <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                        Provider
                        readiness
                      </h2>
                    </div>

                    {Object.entries(
                      data.providers
                    ).map(
                      ([
                        key,
                        provider
                      ]) => (
                        <div
                          className="grid grid-cols-[1fr_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4"
                          key={
                            key
                          }
                        >
                          <div>
                            <strong className="block text-[11px]">
                              {
                                provider.name
                              }
                            </strong>

                            <small className="text-[9px] text-[#756a60]">
                              {
                                key
                              }
                            </small>
                          </div>

                          <StatusBadge
                            status={
                              provider.configured
                                ? 'Configured'
                                : 'Not configured'
                            }
                          />
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
                <div className="grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-1">
                  <article
                    className={
                      metricClass
                    }
                  >
                    <Server
                      size={18}
                      className="mb-4 text-[#681d25]"
                    />

                    <strong
                      className={
                        metricValueClass
                      }
                    >
                      {
                        data.api
                          ?.status
                      }
                    </strong>

                    <span
                      className={
                        metricLabelClass
                      }
                    >
                      API ·{' '}
                      {
                        data.api
                          ?.environment
                      }
                    </span>
                  </article>

                  <article
                    className={
                      metricClass
                    }
                  >
                    <CheckCircle2
                      size={18}
                      className="mb-4 text-[#681d25]"
                    />

                    <strong
                      className={
                        metricValueClass
                      }
                    >
                      {
                        data
                          .database
                          ?.status
                      }
                    </strong>

                    <span
                      className={
                        metricLabelClass
                      }
                    >
                      MongoDB
                    </span>
                  </article>

                  <article
                    className={
                      metricClass
                    }
                  >
                    <Clock3
                      size={18}
                      className="mb-4 text-[#681d25]"
                    />

                    <strong
                      className={
                        metricValueClass
                      }
                    >
                      {Math.floor(
                        Number(
                          data.api
                            ?.uptimeSeconds ||
                            0
                        ) /
                          60
                      )}
                      m
                    </strong>

                    <span
                      className={
                        metricLabelClass
                      }
                    >
                      API uptime
                    </span>
                  </article>
                </div>

                <section
                  className={
                    adminTableClass
                  }
                >
                  <div className="py-6">
                    <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                      Provider
                      readiness
                    </h2>
                  </div>

                  {Object.entries(
                    data.providers ||
                      {}
                  ).map(
                    ([
                      key,
                      provider
                    ]) => (
                      <div
                        className="grid grid-cols-[1fr_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4"
                        key={
                          key
                        }
                      >
                        <div>
                          <strong className="block text-[11px]">
                            {
                              provider.name
                            }
                          </strong>

                          <small className="text-[9px] text-[#756a60]">
                            {
                              key
                            }
                          </small>
                        </div>

                        <StatusBadge
                          status={
                            provider.status
                          }
                        />
                      </div>
                    )
                  )}
                </section>

                <section className="mt-8 border border-[#ddd0c1] bg-[#fffdf8] p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={20}
                      className="text-[#681d25]"
                    />

                    <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                      Operational
                      switches
                    </h2>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {Object.entries(
                      data.platform ||
                        {}
                    ).map(
                      ([
                        key,
                        value
                      ]) => (
                        <span
                          key={
                            key
                          }
                          className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-3 text-[12px]"
                        >
                          {
                            key
                          }

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