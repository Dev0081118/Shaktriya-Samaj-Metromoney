import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Link,
  Route,
  Routes,
  useParams,
  useSearchParams
} from 'react-router-dom';

import {
  RefreshCw
} from 'lucide-react';

import AdminNav from '../../components/AdminNav';

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

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55";

const inputClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[13px] outline-none focus:border-[#681d25]";

const adminRowClass =
  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 text-inherit no-underline max-[767px]:grid-cols-1";

const operationCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-6";

const operationTitleClass =
  "font-['Cormorant_Garamond'] text-[24px] font-medium";

const dlClass =
  "grid gap-[10px]";

const detailRowClass =
  "flex justify-between gap-5 border-b border-[#ddd0c1] pb-2";

const dtClass =
  "capitalize text-[#756a60]";

const ddClass =
  "max-w-[60%] break-words text-right";

const date = (
  value
) => {
  if (!value) {
    return '—';
  }

  return formatDate(
    value,
    undefined,
    {
      dateStyle:
        'medium',

      timeStyle:
        'short'
    }
  );
};

const display = (
  value,
  fallback = '—'
) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return fallback;
  }

  return value;
};

function PageHeader({
  eyebrow,
  title,
  children
}) {
  return (
    <header className="mb-[30px]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
        {eyebrow}
      </p>

      <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
        {title}
      </h1>

      {children}
    </header>
  );
}

function EmptyError({
  children,
  onRetry
}) {
  return (
    <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
      <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
        {children}
      </p>

      {onRetry && (
        <button
          type="button"
          className={`${outlineButtonClass} mt-5`}
          onClick={onRetry}
        >
          <RefreshCw
            size={14}
          />

          Retry
        </button>
      )}
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

  const good =
    [
      'active',
      'paid',
      'resolved',
      'closed'
    ].includes(
      normalized
    );

  const warning =
    [
      'pending',
      'processing',
      'in progress',
      'paused'
    ].includes(
      normalized
    );

  return (
    <span
      className={`inline-flex rounded-[99px] border px-[9px] py-[5px] text-[9px] font-bold uppercase ${
        good
          ? 'border-[#76946f] text-[#45643f]'
          : warning
            ? 'border-[#b58a4c] text-[#75551f]'
            : 'border-[#b46a70] text-[#681d25]'
      }`}
    >
      {status ||
        'Unknown'}
    </span>
  );
}

function CustomerList() {
  const [
    params,
    setParams
  ] =
    useSearchParams();

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

  const query =
    params.toString();

  const endpoint =
    `/admin/customers${
      query
        ? `?${query}`
        : ''
    }`;

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

  const update =
    (
      key,
      value
    ) => {
      const next =
        new URLSearchParams(
          params
        );

      if (value) {
        next.set(
          key,
          value
        );
      } else {
        next.delete(
          key
        );
      }

      if (
        key !==
        'page'
      ) {
        next.set(
          'page',
          '1'
        );
      }

      setData(
        null
      );

      setError('');

      setParams(
        next
      );
    };

  return (
    <>
      <div className="flex items-end justify-between gap-5 max-[767px]:items-start">
        <PageHeader
          eyebrow="Customer operations"
          title="Customers"
        >
          <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
            Search a member by
            identity, profile or
            account information and
            open the complete
            Customer 360 record.
          </p>
        </PageHeader>

        <button
          type="button"
          className={outlineButtonClass}
          disabled={refreshing}
          onClick={reload}
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
      </div>

      <div className="my-6 flex gap-3 max-[767px]:flex-col">
        <input
          aria-label="Search customers"
          placeholder="Name, email, phone or profile ID"
          className={`${inputClass} flex-1`}
          value={
            params.get(
              'search'
            ) ||
            ''
          }
          onChange={(
            event
          ) =>
            update(
              'search',
              event
                .target
                .value
            )
          }
        />

        <select
          aria-label="Account status"
          className={inputClass}
          value={
            params.get(
              'status'
            ) ||
            ''
          }
          onChange={(
            event
          ) =>
            update(
              'status',
              event
                .target
                .value
            )
          }
        >
          <option value="">
            All account
            statuses
          </option>

          {[
            'Active',
            'Suspended',
            'Blocked',
            'Deleted'
          ].map(
            (
              status
            ) => (
              <option
                key={
                  status
                }
              >
                {
                  status
                }
              </option>
            )
          )}
        </select>
      </div>

      {error &&
      !data ? (
        <EmptyError
          onRetry={
            reload
          }
        >
          {error}
        </EmptyError>
      ) : !data ? (
        <div className="page-skeleton">
          Loading customers…
        </div>
      ) : (
        <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
          <div className="flex items-center justify-between gap-4 py-6">
            <div>
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                Customer accounts
              </h2>

              <small className="text-[9px] text-[#756a60]">
                {
                  data.pagination
                    .total
                }{' '}
                total members
              </small>
            </div>
          </div>

          {data.items.map(
            (
              item
            ) => (
              <Link
                className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 text-inherit no-underline max-[767px]:grid-cols-[auto_1fr_auto]"
                to={`/admin/customers/${item._id}`}
                key={
                  item._id
                }
              >
                <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                  {item.profile
                    ?.firstName?.[0] ||
                    item.email?.[0]?.toUpperCase() ||
                    '?'}
                </span>

                <div className="min-w-0">
                  <strong className="block truncate text-[11px]">
                    {item.profile
                      ? `${item.profile.firstName} ${item.profile.lastName || ''}`
                      : item.email}
                  </strong>

                  <small className="block truncate text-[9px] text-[#756a60]">
                    {item.profile
                      ?.profileId ||
                      'No profile'}
                    {' · '}
                    {
                      item.email
                    }
                    {' · '}
                    {item.phone ||
                      'No phone'}
                  </small>

                  {item.subscription && (
                    <small className="mt-1 block text-[8px] font-bold text-[#91683f]">
                      {item.subscription
                        .planNameSnapshot ||
                        item.subscription
                          .plan
                          ?.name ||
                        'Membership'}
                      {' · ends '}
                      {formatDate(
                        item.subscription
                          .endsAt
                      )}
                    </small>
                  )}
                </div>

                <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                  {formatDate(
                    item.createdAt
                  )}
                </time>

                <StatusBadge
                  status={
                    item.status
                  }
                />
              </Link>
            )
          )}

          {!data.items
            .length && (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No customers match
              these filters.
            </p>
          )}

          <div className="flex items-center justify-center gap-[15px] p-5">
            <button
              type="button"
              className={outlineButtonClass}
              disabled={
                data.pagination
                  .page <=
                1
              }
              onClick={() =>
                update(
                  'page',
                  String(
                    data.pagination
                      .page -
                      1
                  )
                )
              }
            >
              Previous
            </button>

            <span className="text-[10px] text-[#756a60]">
              Page{' '}
              {
                data.pagination
                  .page
              }{' '}
              of{' '}
              {
                data.pagination
                  .totalPages
              }
            </span>

            <button
              type="button"
              className={outlineButtonClass}
              disabled={
                data.pagination
                  .page >=
                data.pagination
                  .totalPages
              }
              onClick={() =>
                update(
                  'page',
                  String(
                    data.pagination
                      .page +
                      1
                  )
                )
              }
            >
              Next
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function CustomerDetail() {
  const {
    userId
  } =
    useParams();

  const notify =
    useToast();

  const [
    data,
    setData
  ] =
    useState(null);

  const [
    loadError,
    setLoadError
  ] =
    useState('');

  const [
    refreshing,
    setRefreshing
  ] =
    useState(false);

  const [
    text,
    setText
  ] =
    useState('');

  const [
    category,
    setCategory
  ] =
    useState(
      'General'
    );

  const [
    pendingStatus,
    setPendingStatus
  ] =
    useState('');

  const [
    reason,
    setReason
  ] =
    useState('');

  const [
    savingNote,
    setSavingNote
  ] =
    useState(false);

  const [
    updatingStatus,
    setUpdatingStatus
  ] =
    useState(false);

  const endpoint =
    `/admin/customers/${userId}`;

  const load =
    useCallback(
      async () => {
        setRefreshing(
          true
        );

        setLoadError('');

        try {
          const response =
            await api(
              endpoint
            );

          setData(
            response.data
          );
        } catch (
          error
        ) {
          setLoadError(
            error.message
          );

          notify(
            error.message,
            'error'
          );
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        endpoint,
        notify
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

            setLoadError(
              ''
            );
          }
        )
        .catch(
          (
            error
          ) => {
            if (!active) {
              return;
            }

            setLoadError(
              error.message
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

  const addNote =
    async (
      event
    ) => {
      event.preventDefault();

      const noteText =
        text.trim();

      if (!noteText) {
        notify(
          'Enter an internal note first.',
          'error'
        );

        return;
      }

      setSavingNote(
        true
      );

      try {
        const result =
          await api(
            `/admin/customers/${userId}/notes`,
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  text:
                    noteText,

                  category
                })
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            notes: [
              result.data
                .note,

              ...current.notes
            ]
          })
        );

        setText('');

        notify(
          'Internal note added.'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setSavingNote(
          false
        );
      }
    };

  const updateStatus =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !pendingStatus
      ) {
        return;
      }

      const cleanReason =
        reason.trim();

      if (
        pendingStatus !==
          'Active' &&
        cleanReason.length <
          5
      ) {
        notify(
          'Please provide a reason of at least 5 characters.',
          'error'
        );

        return;
      }

      setUpdatingStatus(
        true
      );

      try {
        await api(
          `/admin/customers/${userId}/status`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                status:
                  pendingStatus,

                ...(pendingStatus !==
                'Active'
                  ? {
                      reason:
                        cleanReason
                    }
                  : {})
              })
          }
        );

        setPendingStatus(
          ''
        );

        setReason('');

        await load();

        notify(
          'Account status updated and audited.'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setUpdatingStatus(
          false
        );
      }
    };

  if (
    loadError &&
    !data
  ) {
    return (
      <EmptyError
        onRetry={load}
      >
        {loadError}
      </EmptyError>
    );
  }

  if (!data) {
    return (
      <div className="page-skeleton">
        Loading Customer 360…
      </div>
    );
  }

  const {
    user,
    profile
  } =
    data;

  const totalCaptured =
    data.payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        (
          [
            'Paid',
            'Refunded'
          ].includes(
            payment.status
          )
            ? Number(
                payment.amount ||
                  0
              )
            : 0
        ),
      0
    );

  const totalRefunded =
    data.payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.refundedAmountPaise ||
            payment.providerRefundedAmountPaise ||
            0
        ) /
          100,
      0
    );

  const gatewayFees =
    data.payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.providerFeePaise ||
            0
        ) /
          100,
      0
    );

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          to="/admin/customers"
          className="text-[12px] font-bold text-[#681d25] no-underline"
        >
          ← Customers
        </Link>

        <button
          type="button"
          className={outlineButtonClass}
          disabled={refreshing}
          onClick={load}
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
      </div>

      <PageHeader
        eyebrow="Customer 360"
        title={
          profile
            ? `${profile.firstName} ${profile.lastName || ''}`
            : user.email
        }
      >
        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          {profile
            ?.profileId ||
            'No matrimonial profile'}
          {' · '}
          {user.status}
        </p>

        <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
          {[
            'Active',
            'Suspended',
            'Blocked'
          ]
            .filter(
              (
                status
              ) =>
                status !==
                user.status
            )
            .map(
              (
                status
              ) => (
                <button
                  type="button"
                  className={
                    status ===
                    'Active'
                      ? primaryButtonClass
                      : outlineButtonClass
                  }
                  onClick={() =>
                    setPendingStatus(
                      status
                    )
                  }
                  key={
                    status
                  }
                >
                  {status ===
                  'Active'
                    ? 'Activate'
                    : status}
                </button>
              )
            )}
        </div>
      </PageHeader>

      {pendingStatus && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#1d1110aa] p-5"
          role="presentation"
        >
          <form
            className="w-full max-w-[480px] border border-[#b89a65] bg-[#fffdf8] p-7 shadow-[0_25px_80px_#0005]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-title"
            onSubmit={
              updateStatus
            }
            noValidate
          >
            <h2
              id="status-title"
              className="font-['Cormorant_Garamond'] text-[30px] font-medium"
            >
              {
                pendingStatus
              }{' '}
              this account?
            </h2>

            <p className="mt-2 text-[11px] leading-6 text-[#756a60]">
              This high-impact
              operation is recorded
              in the audit log.
            </p>

            {pendingStatus !==
              'Active' && (
              <label className="mt-4 block w-full text-[11px] font-bold">
                Reason

                <textarea
                  autoFocus
                  className="mt-2 block min-h-[90px] w-full border border-[#ddd0c1] p-3 outline-none focus:border-[#681d25]"
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
            )}

            <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
              <button
                type="submit"
                className={
                  primaryButtonClass
                }
                disabled={
                  updatingStatus
                }
              >
                {updatingStatus
                  ? 'Updating…'
                  : `Confirm ${pendingStatus.toLowerCase()}`}
              </button>

              <button
                type="button"
                className={
                  outlineButtonClass
                }
                disabled={
                  updatingStatus
                }
                onClick={() => {
                  setPendingStatus(
                    ''
                  );

                  setReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-4 gap-[15px] max-[950px]:grid-cols-2 max-[520px]:grid-cols-1">
        {[
          [
            formatCurrency(
              totalCaptured
            ),

            'Captured'
          ],

          [
            formatCurrency(
              totalRefunded
            ),

            'Refunded'
          ],

          [
            formatCurrency(
              Math.max(
                0,
                totalCaptured -
                  totalRefunded
              )
            ),

            'Customer net'
          ],

          [
            formatCurrency(
              gatewayFees
            ),

            'Razorpay fees'
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
              className="border border-[#ddd0c1] bg-[#fffdf8] p-5"
            >
              <strong className="block font-['Cormorant_Garamond'] text-[30px] font-medium">
                {value}
              </strong>

              <span className="text-[8px] font-bold uppercase text-[#756a60]">
                {
                  label
                }
              </span>
            </article>
          )
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Account
          </h2>

          <dl
            className={
              dlClass
            }
          >
            {[
              [
                'Email',
                user.email
              ],

              [
                'Phone',
                user.phone
              ],

              [
                'Status',
                user.status
              ],

              [
                'Language',
                user.preferredLanguage
              ],

              [
                'Joined',
                date(
                  user.createdAt
                )
              ],

              [
                'Last login',
                date(
                  user.lastLoginAt
                )
              ],

              [
                'Phone verified',
                user.phoneVerified
                  ? 'Yes'
                  : 'No'
              ],

              [
                'Email verified',
                user.emailVerified
                  ? 'Yes'
                  : 'No'
              ]
            ].map(
              ([
                label,
                value
              ]) => (
                <div
                  className={
                    detailRowClass
                  }
                  key={
                    label
                  }
                >
                  <dt
                    className={
                      dtClass
                    }
                  >
                    {label}
                  </dt>

                  <dd
                    className={
                      ddClass
                    }
                  >
                    {display(
                      value
                    )}
                  </dd>
                </div>
              )
            )}
          </dl>
        </section>

        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Profile
          </h2>

          {profile ? (
            <dl
              className={
                dlClass
              }
            >
              {[
                [
                  'Profile ID',
                  profile.profileId
                ],

                [
                  'Status',
                  profile.visibility
                ],

                [
                  'Lifecycle',
                  profile.lifecycleStatus
                ],

                [
                  'Completion',
                  `${profile.completionPercentage || 0}%`
                ],

                [
                  'City',
                  profile.location
                    ?.city
                ],

                [
                  'State',
                  profile.location
                    ?.state
                ],

                [
                  'Marital status',
                  profile.maritalStatus
                ],

                [
                  'Last active',
                  date(
                    profile.lastActiveAt
                  )
                ]
              ].map(
                ([
                  label,
                  value
                ]) => (
                  <div
                    className={
                      detailRowClass
                    }
                    key={
                      label
                    }
                  >
                    <dt
                      className={
                        dtClass
                      }
                    >
                      {label}
                    </dt>

                    <dd
                      className={
                        ddClass
                      }
                    >
                      {display(
                        value
                      )}
                    </dd>
                  </div>
                )
              )}
            </dl>
          ) : (
            <p className="text-[11px] text-[#756a60]">
              No member profile
              exists.
            </p>
          )}
        </section>

        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Matrimonial activity
          </h2>

          <dl
            className={
              dlClass
            }
          >
            {Object.entries(
              data.activity
            ).map(
              ([
                key,
                value
              ]) => (
                <div
                  className={
                    detailRowClass
                  }
                  key={
                    key
                  }
                >
                  <dt
                    className={
                      dtClass
                    }
                  >
                    {key}
                  </dt>

                  <dd
                    className={
                      ddClass
                    }
                  >
                    {
                      value
                    }
                  </dd>
                </div>
              )
            )}

            <div
              className={
                detailRowClass
              }
            >
              <dt
                className={
                  dtClass
                }
              >
                Reports submitted
              </dt>

              <dd
                className={
                  ddClass
                }
              >
                {data.safety
                  ?.reportsSubmitted ||
                  0}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Relationship manager
          </h2>

          {data.assignment ? (
            <dl
              className={
                dlClass
              }
            >
              <div
                className={
                  detailRowClass
                }
              >
                <dt
                  className={
                    dtClass
                  }
                >
                  Manager
                </dt>

                <dd
                  className={
                    ddClass
                  }
                >
                  {data.assignment
                    .manager
                    ?.email ||
                    'Unavailable'}
                </dd>
              </div>

              <div
                className={
                  detailRowClass
                }
              >
                <dt
                  className={
                    dtClass
                  }
                >
                  Phone
                </dt>

                <dd
                  className={
                    ddClass
                  }
                >
                  {data.assignment
                    .manager
                    ?.phone ||
                    '—'}
                </dd>
              </div>

              <div
                className={
                  detailRowClass
                }
              >
                <dt
                  className={
                    dtClass
                  }
                >
                  Status
                </dt>

                <dd
                  className={
                    ddClass
                  }
                >
                  {data.assignment
                    .status}
                </dd>
              </div>

              <div
                className={
                  detailRowClass
                }
              >
                <dt
                  className={
                    dtClass
                  }
                >
                  Assigned
                </dt>

                <dd
                  className={
                    ddClass
                  }
                >
                  {date(
                    data.assignment
                      .assignedAt
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-[11px] text-[#756a60]">
              No relationship
              manager assigned.
            </p>
          )}

          <Link
            to="/admin/relationship-managers"
            className={`${outlineButtonClass} mt-5 no-underline`}
          >
            Manage assignment
          </Link>
        </section>

        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Membership
          </h2>

          {data.subscriptions
            .length ? (
            <div className="grid gap-4">
              {data.subscriptions.map(
                (
                  subscription
                ) => (
                  <div
                    key={
                      subscription._id
                    }
                    className="border-b border-[#ddd0c1] pb-3"
                  >
                    <strong className="block text-[12px]">
                      {subscription.planNameSnapshot ||
                        subscription
                          .plan
                          ?.name ||
                        'Membership'}
                    </strong>

                    <small className="mt-1 block text-[9px] text-[#756a60]">
                      {
                        subscription.status
                      }
                      {' · '}
                      {date(
                        subscription.startsAt
                      )}
                      {' → '}
                      {date(
                        subscription.endsAt
                      )}
                    </small>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[#756a60]">
              No subscription
              history.
            </p>
          )}
        </section>

        <section
          className={
            operationCardClass
          }
        >
          <h2
            className={
              operationTitleClass
            }
          >
            Legal consent
          </h2>

          <dl
            className={
              dlClass
            }
          >
            <div
              className={
                detailRowClass
              }
            >
              <dt
                className={
                  dtClass
                }
              >
                Terms version
              </dt>

              <dd
                className={
                  ddClass
                }
              >
                {display(
                  user.acceptedTermsVersion
                )}
              </dd>
            </div>

            <div
              className={
                detailRowClass
              }
            >
              <dt
                className={
                  dtClass
                }
              >
                Privacy version
              </dt>

              <dd
                className={
                  ddClass
                }
              >
                {display(
                  user.acceptedPrivacyVersion
                )}
              </dd>
            </div>

            <div
              className={
                detailRowClass
              }
            >
              <dt
                className={
                  dtClass
                }
              >
                Accepted
              </dt>

              <dd
                className={
                  ddClass
                }
              >
                {date(
                  user.acceptedAt
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
        <div className="py-6">
          <h2
            className={
              operationTitleClass
            }
          >
            Payments
          </h2>
        </div>

        {data.payments.map(
          (
            payment
          ) => {
            const refunded =
              Number(
                payment.refundedAmountPaise ||
                  payment.providerRefundedAmountPaise ||
                  0
              ) /
              100;

            const gatewayFee =
              Number(
                payment.providerFeePaise ||
                  0
              ) /
              100;

            return (
              <div
                className={
                  adminRowClass
                }
                key={
                  payment._id
                }
              >
                <div className="min-w-0">
                  <strong className="block text-[11px]">
                    {payment.plan
                      ?.name ||
                      'Historical plan'}
                  </strong>

                  <small className="mt-1 block break-all text-[9px] text-[#756a60]">
                    {payment.providerPaymentId ||
                      payment.providerOrderId ||
                      'No provider reference'}
                  </small>

                  <small className="mt-1 block text-[8px] text-[#91867d]">
                    {payment.providerMethod ||
                      payment.provider ||
                      'Unknown provider'}
                    {payment.providerFinancialSyncedAt
                      ? ' · Razorpay reconciled'
                      : ''}
                  </small>
                </div>

                <time className="text-[9px] text-[#756a60]">
                  {date(
                    payment.verifiedAt ||
                      payment.createdAt
                  )}
                </time>

                <div className="text-right">
                  <strong className="block text-[11px]">
                    {formatCurrency(
                      payment.amount
                    )}
                  </strong>

                  <StatusBadge
                    status={
                      payment.status
                    }
                  />

                  {refunded >
                    0 && (
                    <small className="mt-1 block text-[8px] text-[#681d25]">
                      Refunded{' '}
                      {formatCurrency(
                        refunded
                      )}
                    </small>
                  )}

                  {gatewayFee >
                    0 && (
                    <small className="block text-[8px] text-[#756a60]">
                      Gateway{' '}
                      {formatCurrency(
                        gatewayFee
                      )}
                    </small>
                  )}
                </div>
              </div>
            );
          }
        )}

        {!data.payments
          .length && (
          <p className="p-[25px] text-[12px] text-[#756a60]">
            No payments.
          </p>
        )}
      </section>

      <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
        <div className="py-6">
          <h2
            className={
              operationTitleClass
            }
          >
            Support tickets
          </h2>
        </div>

        {data.tickets.map(
          (
            ticket
          ) => (
            <div
              className={
                adminRowClass
              }
              key={
                ticket._id
              }
            >
              <div className="min-w-0">
                <strong className="block text-[11px]">
                  {
                    ticket.category
                  }{' '}
                  ·{' '}
                  {
                    ticket.priority
                  }
                </strong>

                <small className="mt-1 block break-words text-[9px] leading-5 text-[#756a60]">
                  {
                    ticket.message
                  }
                </small>

                {ticket.assignedTo && (
                  <small className="block text-[8px] text-[#91867d]">
                    Assigned to{' '}
                    {
                      ticket.assignedTo
                        .email
                    }
                  </small>
                )}
              </div>

              <time className="text-[9px] text-[#756a60]">
                {date(
                  ticket.createdAt
                )}
              </time>

              <StatusBadge
                status={
                  ticket.status
                }
              />
            </div>
          )
        )}

        {!data.tickets
          .length && (
          <p className="p-[25px] text-[12px] text-[#756a60]">
            No support
            tickets.
          </p>
        )}
      </section>

      <section
        className={`${operationCardClass} mt-10`}
      >
        <h2
          className={
            operationTitleClass
          }
        >
          Internal customer notes
        </h2>

        <p className="mt-1 text-[9px] leading-5 text-[#756a60]">
          These notes are internal
          and are not shown to the
          member or relationship
          manager workspace.
        </p>

        <form
          className="my-[15px] mb-[25px] grid gap-[10px]"
          onSubmit={
            addNote
          }
          noValidate
        >
          <select
            aria-label="Note category"
            className={
              inputClass
            }
            value={
              category
            }
            onChange={(
              event
            ) =>
              setCategory(
                event
                  .target
                  .value
              )
            }
          >
            {[
              'General',
              'Support',
              'Safety',
              'Payment',
              'Verification',
              'Relationship Manager'
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

          <textarea
            maxLength="2000"
            className={`${inputClass} min-h-[90px] resize-y`}
            value={
              text
            }
            onChange={(
              event
            ) =>
              setText(
                event
                  .target
                  .value
              )
            }
            placeholder="Add an internal operational note…"
          />

          <button
            type="submit"
            className={
              primaryButtonClass
            }
            disabled={
              savingNote
            }
          >
            {savingNote
              ? 'Adding…'
              : 'Add note'}
          </button>
        </form>

        {data.notes.map(
          (
            note
          ) => (
            <div
              className="border-t border-[#ddd0c1] py-[15px]"
              key={
                note._id
              }
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-[11px]">
                  {
                    note.category
                  }
                </strong>

                <time className="text-[8px] text-[#91867d]">
                  {date(
                    note.createdAt
                  )}
                </time>
              </div>

              <p className="my-[6px] whitespace-pre-wrap text-[11px] leading-6">
                {
                  note.text
                }
              </p>

              <small className="text-[8px] text-[#756a60]">
                {note.author
                  ?.email ||
                  'System'}
                {' · '}
                {note.author
                  ?.role ||
                  'staff'}
              </small>
            </div>
          )
        )}

        {!data.notes
          .length && (
          <p className="border-t border-[#ddd0c1] py-5 text-[10px] text-[#756a60]">
            No internal notes yet.
          </p>
        )}
      </section>

      <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
        <div className="py-6">
          <h2
            className={
              operationTitleClass
            }
          >
            Audit history
          </h2>
        </div>

        {data.audit.map(
          (
            item
          ) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#ddd0c1] py-4 max-[600px]:grid-cols-1"
              key={
                item._id
              }
            >
              <div>
                <strong className="block text-[10px]">
                  {
                    item.action
                  }
                </strong>

                <small className="mt-1 block text-[8px] text-[#756a60]">
                  {item.actor
                    ?.email ||
                    'System'}
                  {' · '}
                  {item.actor
                    ?.role ||
                    'system'}
                </small>
              </div>

              <time className="text-[8px] text-[#756a60]">
                {date(
                  item.createdAt
                )}
              </time>
            </div>
          )
        )}

        {!data.audit
          .length && (
          <p className="p-[25px] text-[12px] text-[#756a60]">
            No audit activity
            recorded for this
            account.
          </p>
        )}
      </section>
    </>
  );
}

export default function CustomerOperationsPage() {
  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <Routes>
          <Route
            index
            element={
              <CustomerList />
            }
          />

          <Route
            path=":userId"
            element={
              <CustomerDetail />
            }
          />
        </Routes>
      </main>
    </div>
  );
}