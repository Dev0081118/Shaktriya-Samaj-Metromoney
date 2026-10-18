import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Route,
  Routes,
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  UserRound,
  WalletCards
} from 'lucide-react';

import AdminNav from '../../components/AdminNav';

import {
  useAuth
} from '../../context/AuthContext';

import {
  useToast
} from '../../context/ToastContext';

import {
  api,
  assetUrl
} from '../../services/api';

import {
  formatCurrency,
  formatDate
} from '../../utils/formatters';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55";

const adminTableClass =
  "mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]";

const adminRowClass =
  "grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[auto_1fr]";

const reportRowClass =
  "grid grid-cols-[1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-1";

const metricCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const metricValueClass =
  "block font-['Cormorant_Garamond'] text-[34px] font-medium text-[#2c1a18]";

const metricLabelClass =
  "mt-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-[#756a60]";

const operationCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-6";

const detailCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-5";

const detailLabelClass =
  "text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#756a60]";

const detailValueClass =
  "mt-1 break-words font-['Cormorant_Garamond'] text-[20px] font-medium text-[#2c1a18]";

const displayValue = (
  value,
  fallback = 'Not provided'
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

function Async({
  path,
  children
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
              path
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
        path
      ]
    );

  useEffect(
    () => {
      let active =
        true;

      api(path)
        .then(
          (
            response
          ) => {
            if (
              !active
            ) {
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
            if (
              !active
            ) {
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
      path
    ]
  );

  if (
    error &&
    !data
  ) {
    return (
      <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
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
          <RefreshCw
            size={15}
          />

          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-skeleton">
        Loading administration
        data…
      </div>
    );
  }

  return children(
    data,
    setData,
    {
      reload,
      refreshing,
      error
    }
  );
}

function Overview() {
  const navigate =
    useNavigate();

  const {
    user
  } =
    useAuth();

  return (
    <Async path="/admin/dashboard">
      {(
        data,
        _setData,
        {
          reload,
          refreshing
        }
      ) => (
        <>
          <header className="mb-[30px] flex items-end justify-between gap-5 max-[767px]:items-start">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Operations control
                center
              </p>

              <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
                Business overview
              </h1>

              <p className="mt-4 max-w-[700px] text-[13px] leading-7 text-[#756a60]">
                Live operational
                snapshot of members,
                moderation,
                matrimonial activity
                and memberships.
              </p>
            </div>

            <button
              type="button"
              className={
                outlineButtonClass
              }
              disabled={
                refreshing
              }
              onClick={
                reload
              }
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

          <div className="grid grid-cols-4 gap-[15px] max-[1100px]:grid-cols-3 max-[767px]:grid-cols-2">
            {[
              [
                data.customers
                  ?.total ||
                  0,

                'Total customers'
              ],

              [
                data.customers
                  ?.active ||
                  0,

                'Active accounts'
              ],

              [
                data.profiles
                  ?.active ||
                  0,

                'Active profiles'
              ],

              [
                data.subscriptions
                  ?.active ||
                  0,

                'Paid members'
              ],

              ...(data.finance
                ? [
                    [
                      formatCurrency(
                        data.finance
                          .capturedRevenue ||
                          0
                      ),

                      'Captured revenue'
                    ]
                  ]
                : []),

              [
                data.supportSafety
                  ?.pendingModeration ||
                  0,

                'Pending moderation'
              ],

              [
                data.supportSafety
                  ?.openReports ||
                  0,

                'Open reports'
              ],

              [
                data.supportSafety
                  ?.openSupport ||
                  0,

                'Support tickets'
              ],

              [
                data.subscriptions
                  ?.expiringIn7Days ||
                  0,

                'Expiring in 7 days'
              ]
            ].map(
              ([
                value,
                label
              ]) => (
                <article
                  className={
                    metricCardClass
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
                    {value}
                  </strong>

                  <span
                    className={
                      metricLabelClass
                    }
                  >
                    {label}
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
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#2c1a18]">
                Customer
                acquisition
              </h2>

              <p className="mb-5 mt-1 text-[11px] text-[#756a60]">
                Account creation and
                verification activity.
              </p>

              <div className="grid gap-3">
                {[
                  [
                    'Today',
                    data.customers
                      ?.today ||
                      0
                  ],

                  [
                    'This week',
                    data.customers
                      ?.week ||
                      0
                  ],

                  [
                    'This month',
                    data.customers
                      ?.month ||
                      0
                  ],

                  [
                    'Verified',
                    data.customers
                      ?.verified ||
                      0
                  ],

                  [
                    'Suspended',
                    data.customers
                      ?.suspended ||
                      0
                  ],

                  [
                    'Blocked',
                    data.customers
                      ?.blocked ||
                      0
                  ]
                ].map(
                  ([
                    label,
                    value
                  ]) => (
                    <span
                      key={
                        label
                      }
                      className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-2 text-[12px]"
                    >
                      {label}

                      <strong>
                        {value}
                      </strong>
                    </span>
                  )
                )}
              </div>

              {[
                'admin',
                'super_admin'
              ].includes(
                user?.role
              ) && (
                <button
                  type="button"
                  className={`${outlineButtonClass} mt-5`}
                  onClick={() =>
                    navigate(
                      '/admin/customers'
                    )
                  }
                >
                  Manage customers

                  <ArrowRight
                    size={14}
                  />
                </button>
              )}
            </section>

            <section
              className={
                operationCardClass
              }
            >
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#2c1a18]">
                Matrimonial
                activity
              </h2>

              <p className="mb-5 mt-1 text-[11px] text-[#756a60]">
                Member engagement and
                relationship activity.
              </p>

              <div className="grid gap-3">
                {[
                  [
                    'Interests',
                    data.matrimonial
                      ?.interests ||
                      0
                  ],

                  [
                    'Pending interests',
                    data.matrimonial
                      ?.pendingInterests ||
                      0
                  ],

                  [
                    'Matches',
                    data.matrimonial
                      ?.matches ||
                      0
                  ],

                  [
                    'Contact requests',
                    data.matrimonial
                      ?.contactRequests ||
                      0
                  ],

                  [
                    'Contact unlocks',
                    data.matrimonial
                      ?.contactUnlocks ||
                      0
                  ],

                  [
                    'Shortlists',
                    data.matrimonial
                      ?.shortlists ||
                      0
                  ]
                ].map(
                  ([
                    label,
                    value
                  ]) => (
                    <span
                      key={
                        label
                      }
                      className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-2 text-[12px]"
                    >
                      {label}

                      <strong>
                        {value}
                      </strong>
                    </span>
                  )
                )}
              </div>

              <button
                type="button"
                className={`${outlineButtonClass} mt-5`}
                onClick={() =>
                  navigate(
                    '/admin/profiles'
                  )
                }
              >
                Review profiles

                <ArrowRight
                  size={14}
                />
              </button>
            </section>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-[15px] max-[900px]:grid-cols-1">
            <button
              type="button"
              className="flex items-center justify-between border border-[#ddd0c1] bg-[#fffdf8] p-5 text-left transition hover:border-[#aa7a42]"
              onClick={() =>
                navigate(
                  '/admin/profiles'
                )
              }
            >
              <span>
                <ShieldCheck
                  size={20}
                  className="mb-3 text-[#681d25]"
                />

                <strong className="block font-['Cormorant_Garamond'] text-[24px] font-medium">
                  Moderation queue
                </strong>

                <small className="text-[10px] text-[#756a60]">
                  {
                    data
                      .supportSafety
                      ?.pendingModeration ||
                    0
                  }{' '}
                  profiles waiting
                </small>
              </span>

              <ArrowRight
                size={17}
              />
            </button>

            {[
              'admin',
              'super_admin'
            ].includes(
              user?.role
            ) && (
              <button
                type="button"
                className="flex items-center justify-between border border-[#ddd0c1] bg-[#fffdf8] p-5 text-left transition hover:border-[#aa7a42]"
                onClick={() =>
                  navigate(
                    '/admin/subscriptions'
                  )
                }
              >
                <span>
                  <UserRound
                    size={20}
                    className="mb-3 text-[#681d25]"
                  />

                  <strong className="block font-['Cormorant_Garamond'] text-[24px] font-medium">
                    Memberships
                  </strong>

                  <small className="text-[10px] text-[#756a60]">
                    {
                      data
                        .subscriptions
                        ?.active ||
                      0
                    }{' '}
                    active
                  </small>
                </span>

                <ArrowRight
                  size={17}
                />
              </button>
            )}

            {user?.role ===
              'super_admin' && (
              <button
                type="button"
                className="flex items-center justify-between border border-[#ddd0c1] bg-[#fffdf8] p-5 text-left transition hover:border-[#aa7a42]"
                onClick={() =>
                  navigate(
                    '/admin/revenue'
                  )
                }
              >
                <span>
                  <WalletCards
                    size={20}
                    className="mb-3 text-[#681d25]"
                  />

                  <strong className="block font-['Cormorant_Garamond'] text-[24px] font-medium">
                    Revenue
                  </strong>

                  <small className="text-[10px] text-[#756a60]">
                    Payment analytics
                  </small>
                </span>

                <ArrowRight
                  size={17}
                />
              </button>
            )}
          </div>

          <Queue />
        </>
      )}
    </Async>
  );
}

function Queue() {
  const navigate =
    useNavigate();

  return (
    <Async path="/admin/profiles?status=pending_review">
      {(
        data,
        _setData,
        {
          reload,
          refreshing
        }
      ) => (
        <section
          className={
            adminTableClass
          }
        >
          <div className="my-6 mt-[52px] flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Queue
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
                Profiles awaiting
                review
              </h2>
            </div>

            <button
              type="button"
              className={
                outlineButtonClass
              }
              onClick={
                reload
              }
              disabled={
                refreshing
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
          </div>

          {data.profiles
            ?.length ? (
            data.profiles.map(
              (
                profile
              ) => (
                <div
                  className={
                    adminRowClass
                  }
                  key={
                    profile._id
                  }
                >
                  <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                    {profile
                      .firstName?.[0] ||
                      '?'}
                  </span>

                  <div>
                    <strong className="block text-[11px]">
                      {
                        profile.firstName
                      }{' '}
                      {
                        profile.lastName
                      }
                    </strong>

                    <small className="block text-[9px] text-[#756a60]">
                      {
                        profile.profileId
                      }{' '}
                      •{' '}
                      {
                        profile
                          .location
                          ?.city ||
                        'Location pending'
                      }
                    </small>
                  </div>

                  <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                    {formatDate(
                      profile.createdAt
                    )}
                  </time>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/profiles/${profile._id}`
                      )
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    Review
                  </button>
                </div>
              )
            )
          ) : (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No profiles are
              currently awaiting
              review.
            </p>
          )}
        </section>
      )}
    </Async>
  );
}

function Review() {
  const {
    id
  } =
    useParams();

  const notify =
    useToast();

  const navigate =
    useNavigate();

  const [
    notes,
    setNotes
  ] =
    useState('');

  const [
    busyAction,
    setBusyAction
  ] =
    useState('');

  return (
    <Async
      path={`/admin/profiles/${id}`}
    >
      {(
        data,
        _setData,
        {
          reload
        }
      ) => {
        const profile =
          data.profile;

        const act =
          async (
            action
          ) => {
            if (
              [
                'changes',
                'reject',
                'suspend'
              ].includes(
                action
              ) &&
              notes
                .trim()
                .length <
                5
            ) {
              notify(
                'Please enter a meaningful moderation note before this action.',
                'error'
              );

              return;
            }

            setBusyAction(
              action
            );

            try {
              await api(
                `/admin/profiles/${id}/${action}`,
                {
                  method:
                    'PATCH',

                  body:
                    JSON.stringify({
                      notes:
                        notes.trim()
                    })
                }
              );

              notify(
                'Moderation decision saved.'
              );

              navigate(
                '/admin/profiles'
              );
            } catch (
              error
            ) {
              notify(
                error.message,
                'error'
              );

              await reload();
            } finally {
              setBusyAction(
                ''
              );
            }
          };

        return (
          <article className="max-w-[1050px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[767px]:p-5">
            <header className="flex items-start gap-[30px] max-[767px]:flex-col">
              {profile
                .profilePhoto && (
                <img
                  src={assetUrl(
                    profile
                      .profilePhoto
                  )}
                  alt=""
                  className="h-[190px] w-[150px] object-cover"
                />
              )}

              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                  {
                    profile.profileId
                  }
                </p>

                <h1 className="mt-2 font-['Cormorant_Garamond'] text-[48px] font-medium leading-none text-[#2c1a18] max-[767px]:text-[36px]">
                  {
                    profile.firstName
                  }{' '}
                  {
                    profile.middleName
                  }{' '}
                  {
                    profile.lastName
                  }
                </h1>

                <p className="mt-3 text-[12px] text-[#756a60]">
                  {profile
                    .location
                    ?.city ||
                    'City not provided'}
                  ,{' '}
                  {profile
                    .location
                    ?.state ||
                    'State not provided'}{' '}
                  •{' '}
                  {
                    profile.visibility
                  }
                </p>

                {profile
                  .moderationNotes && (
                  <p className="mt-4 border-l-2 border-[#aa7a42] pl-4 text-[11px] leading-6 text-[#756a60]">
                    Previous note:{' '}
                    {
                      profile
                        .moderationNotes
                    }
                  </p>
                )}
              </div>
            </header>

            <section className="mt-8">
              <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
                Profile details
              </h2>

              <p className="mt-3 max-w-[850px] text-[12px] leading-7 text-[#756a60]">
                {profile.aboutMe ||
                  'No introduction supplied.'}
              </p>

              <dl className="mt-5 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
                {[
                  [
                    'Profile for',
                    profile.profileFor
                  ],

                  [
                    'Gender',
                    profile.gender
                  ],

                  [
                    'Date of birth',
                    profile
                      .dateOfBirth
                      ? formatDate(
                          profile
                            .dateOfBirth
                        )
                      : null
                  ],

                  [
                    'Age',
                    profile.age
                  ],

                  [
                    'Height',
                    profile.height
                      ? `${profile.height} cm`
                      : null
                  ],

                  [
                    'Marital status',
                    profile.maritalStatus
                  ],

                  [
                    'Education',
                    profile
                      .education
                      ?.highestEducation
                  ],

                  [
                    'Occupation',
                    profile
                      .career
                      ?.occupation
                  ],

                  [
                    'Company',
                    profile
                      .career
                      ?.companyName ||
                      profile
                        .career
                        ?.businessName
                  ],

                  [
                    'Community',
                    profile
                      .community
                      ?.name
                  ],

                  [
                    'Clan',
                    profile
                      .community
                      ?.clan ||
                      profile
                        .paternalFamily
                        ?.clan
                  ],

                  [
                    'Native place',
                    profile
                      .paternalFamily
                      ?.nativePlace ||
                      profile
                        .location
                        ?.nativePlace
                  ]
                ].map(
                  ([
                    label,
                    value
                  ]) => (
                    <div
                      key={
                        label
                      }
                      className={
                        detailCardClass
                      }
                    >
                      <dt
                        className={
                          detailLabelClass
                        }
                      >
                        {label}
                      </dt>

                      <dd
                        className={
                          detailValueClass
                        }
                      >
                        {displayValue(
                          value
                        )}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </section>

            <section className="mt-8 grid grid-cols-2 gap-4 max-[767px]:grid-cols-1">
              <div
                className={
                  detailCardClass
                }
              >
                <h3 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                  Family
                </h3>

                <p className="mt-3 text-[11px] leading-7 text-[#756a60]">
                  Father:{' '}
                  {displayValue(
                    profile.family
                      ?.fatherName
                  )}
                </p>

                <p className="text-[11px] leading-7 text-[#756a60]">
                  Mother:{' '}
                  {displayValue(
                    profile.family
                      ?.motherName
                  )}
                </p>

                <p className="text-[11px] leading-7 text-[#756a60]">
                  Family location:{' '}
                  {displayValue(
                    profile.family
                      ?.familyLocation
                  )}
                </p>
              </div>

              <div
                className={
                  detailCardClass
                }
              >
                <h3 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                  Heritage
                </h3>

                <p className="mt-3 text-[11px] leading-7 text-[#756a60]">
                  Paternal village:{' '}
                  {displayValue(
                    profile
                      .paternalFamily
                      ?.ancestralVillage
                  )}
                </p>

                <p className="text-[11px] leading-7 text-[#756a60]">
                  Maternal surname:{' '}
                  {displayValue(
                    profile
                      .maternalFamily
                      ?.maternalFamilySurname
                  )}
                </p>

                <p className="text-[11px] leading-7 text-[#756a60]">
                  Maternal village:{' '}
                  {displayValue(
                    profile
                      .maternalFamily
                      ?.maternalVillage ||
                      profile
                        .maternalFamily
                        ?.maternalNativePlace
                  )}
                </p>
              </div>
            </section>

            <label className="mt-8 grid gap-2 text-[10px] font-bold uppercase tracking-[0.1em]">
              Moderation notes

              <textarea
                rows="5"
                className="border border-[#ddd0c1] bg-white p-[13px] text-[13px] font-normal normal-case tracking-normal outline-none focus:border-[#681d25]"
                value={
                  notes
                }
                onChange={(
                  event
                ) =>
                  setNotes(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Explain approval concerns, requested corrections or suspension reason."
              />
            </label>

            <div className="mt-7 flex flex-wrap gap-[10px]">
              <button
                type="button"
                onClick={() =>
                  act(
                    'approve'
                  )
                }
                disabled={
                  !!busyAction
                }
                className={
                  primaryButtonClass
                }
              >
                {busyAction ===
                'approve'
                  ? 'Saving…'
                  : 'Approve'}
              </button>

              <button
                type="button"
                onClick={() =>
                  act(
                    'changes'
                  )
                }
                disabled={
                  !!busyAction
                }
                className={
                  outlineButtonClass
                }
              >
                Request changes
              </button>

              <button
                type="button"
                onClick={() =>
                  act(
                    'reject'
                  )
                }
                disabled={
                  !!busyAction
                }
                className={
                  outlineButtonClass
                }
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() =>
                  act(
                    'suspend'
                  )
                }
                disabled={
                  !!busyAction
                }
                className={
                  outlineButtonClass
                }
              >
                Suspend
              </button>

              <button
                type="button"
                className={
                  outlineButtonClass
                }
                onClick={() =>
                  navigate(
                    '/admin/profiles'
                  )
                }
              >
                Back
              </button>
            </div>
          </article>
        );
      }}
    </Async>
  );
}

function Users() {
  const notify =
    useToast();

  const {
    user
  } =
    useAuth();

  const [
    busyUser,
    setBusyUser
  ] =
    useState('');

  const change =
    async (
      target,
      patch,
      setData
    ) => {
      setBusyUser(
        target._id
      );

      try {
        const result =
          await api(
            `/admin/users/${target._id}`,
            {
              method:
                'PATCH',

              body:
                JSON.stringify(
                  patch
                )
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            users:
              current.users.map(
                (
                  item
                ) =>
                  item._id ===
                  target._id
                    ? result
                        .data
                        .user
                    : item
              )
          })
        );

        notify(
          'User access updated.'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setBusyUser(
          ''
        );
      }
    };

  const changeStatus =
    async (
      member,
      nextStatus,
      setData
    ) => {
      if (
        nextStatus ===
        member.status
      ) {
        return;
      }

      let reason;

      if (
        nextStatus !==
        'Active'
      ) {
        reason =
          window.prompt(
            `Reason for changing ${member.email} to ${nextStatus}:`
          );

        if (
          reason ===
          null
        ) {
          return;
        }

        reason =
          reason.trim();

        if (
          reason.length <
          5
        ) {
          notify(
            'Please provide a reason of at least 5 characters.',
            'error'
          );

          return;
        }
      }

      await change(
        member,
        {
          status:
            nextStatus,

          ...(reason
            ? {
                reason
              }
            : {})
        },
        setData
      );
    };

  const changeRole =
    async (
      member,
      role,
      setData
    ) => {
      if (
        role ===
        member.role
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Change ${member.email} role from ${member.role} to ${role}?`
        );

      if (!confirmed) {
        return;
      }

      await change(
        member,
        {
          role
        },
        setData
      );
    };

  return (
    <Async path="/admin/users">
      {(
        data,
        setData,
        {
          reload,
          refreshing
        }
      ) => (
        <section
          className={
            adminTableClass
          }
        >
          <div className="my-6 mt-[52px] flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Access control
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
                Members and staff
              </h2>
            </div>

            <button
              type="button"
              className={
                outlineButtonClass
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
          </div>

          {data.users
            ?.length ? (
            data.users.map(
              (
                member
              ) => (
                <div
                  className={
                    adminRowClass
                  }
                  key={
                    member._id
                  }
                >
                  <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                    {member
                      .email?.[0]
                      ?.toUpperCase() ||
                      '?'}
                  </span>

                  <div className="min-w-0">
                    <strong className="block truncate text-[11px]">
                      {
                        member.email
                      }
                    </strong>

                    <small className="block text-[9px] text-[#756a60]">
                      {member.phone ||
                        'No phone'}{' '}
                      •{' '}
                      {
                        member.role
                      }
                    </small>
                  </div>

                  <select
                    aria-label={`Status for ${member.email}`}
                    className="border border-[#ddd0c1] bg-white p-[10px] text-[11px]"
                    value={
                      member.status
                    }
                    disabled={
                      busyUser ===
                      member._id
                    }
                    onChange={(
                      event
                    ) =>
                      changeStatus(
                        member,
                        event
                          .target
                          .value,
                        setData
                      )
                    }
                  >
                    {[
                      'Active',
                      'Suspended',
                      'Blocked'
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

                  {user?.role ===
                    'super_admin' && (
                    <select
                      aria-label={`Role for ${member.email}`}
                      className="border border-[#ddd0c1] bg-white p-[10px] text-[11px]"
                      value={
                        member.role
                      }
                      disabled={
                        busyUser ===
                        member._id
                      }
                      onChange={(
                        event
                      ) =>
                        changeRole(
                          member,
                          event
                            .target
                            .value,
                          setData
                        )
                      }
                    >
                      {[
                        'member',
                        'moderator',
                        'admin',
                        'relationship_manager',
                        'super_admin'
                      ].map(
                        (
                          role
                        ) => (
                          <option
                            key={
                              role
                            }
                          >
                            {
                              role
                            }
                          </option>
                        )
                      )}
                    </select>
                  )}
                </div>
              )
            )
          ) : (
            <p className="p-6 text-[12px] text-[#756a60]">
              No users found.
            </p>
          )}
        </section>
      )}
    </Async>
  );
}

function Reports() {
  const notify =
    useToast();

  const [
    busyReport,
    setBusyReport
  ] =
    useState('');

  return (
    <Async path="/admin/reports">
      {(
        data,
        setData,
        {
          reload,
          refreshing
        }
      ) => (
        <section
          className={
            adminTableClass
          }
        >
          <div className="my-6 mt-[52px] flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Safety
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
                Member reports
              </h2>
            </div>

            <button
              type="button"
              className={
                outlineButtonClass
              }
              onClick={
                reload
              }
              disabled={
                refreshing
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
          </div>

          {data.reports
            ?.length ? (
            data.reports.map(
              (
                report
              ) => (
                <div
                  className={
                    reportRowClass
                  }
                  key={
                    report._id
                  }
                >
                  <div>
                    <strong className="block text-[11px]">
                      {report.reason}

                      {report
                        .reportedProfile
                        ?.firstName
                        ? `: ${report.reportedProfile.firstName} ${report.reportedProfile.lastName || ''}`
                        : ''}
                    </strong>

                    <small className="mt-1 block max-w-[700px] text-[9px] leading-5 text-[#756a60]">
                      {report.description ||
                        'No description provided.'}
                      {' • '}
                      reported by{' '}
                      {report.reporter
                        ?.email ||
                        'Unknown member'}
                    </small>
                  </div>

                  <span className="text-[9px] font-bold uppercase text-[#756a60]">
                    {
                      report.status
                    }
                  </span>

                  <select
                    aria-label={`Report status ${report._id}`}
                    className="border border-[#ddd0c1] bg-white p-[10px] text-[11px]"
                    value={
                      report.status
                    }
                    disabled={
                      busyReport ===
                      report._id
                    }
                    onChange={async (
                      event
                    ) => {
                      const nextStatus =
                        event
                          .target
                          .value;

                      if (
                        nextStatus ===
                        report.status
                      ) {
                        return;
                      }

                      setBusyReport(
                        report._id
                      );

                      try {
                        const result =
                          await api(
                            `/admin/reports/${report._id}`,
                            {
                              method:
                                'PATCH',

                              body:
                                JSON.stringify({
                                  status:
                                    nextStatus
                                })
                            }
                          );

                        setData(
                          (
                            current
                          ) => ({
                            ...current,

                            reports:
                              current.reports.map(
                                (
                                  item
                                ) =>
                                  item._id ===
                                  report._id
                                    ? result
                                        .data
                                        .report
                                    : item
                              )
                          })
                        );

                        notify(
                          'Report updated.'
                        );
                      } catch (
                        error
                      ) {
                        notify(
                          error.message,
                          'error'
                        );

                        await reload();
                      } finally {
                        setBusyReport(
                          ''
                        );
                      }
                    }}
                  >
                    <option
                      value="Open"
                      disabled
                    >
                      Open
                    </option>

                    <option value="Reviewed">
                      Reviewed
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                    <option value="Dismissed">
                      Dismissed
                    </option>
                  </select>
                </div>
              )
            )
          ) : (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No member reports.
            </p>
          )}
        </section>
      )}
    </Async>
  );
}

function Subscriptions() {
  return (
    <Async path="/admin/subscriptions">
      {(
        data,
        _setData,
        {
          reload,
          refreshing
        }
      ) => (
        <section
          className={
            adminTableClass
          }
        >
          <div className="my-6 mt-[52px] flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Memberships
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
                Subscriptions
              </h2>
            </div>

            <button
              type="button"
              className={
                outlineButtonClass
              }
              onClick={
                reload
              }
              disabled={
                refreshing
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
          </div>

          {data
            .subscriptions
            ?.length ? (
            data.subscriptions.map(
              (
                subscription
              ) => {
                const paidAmount =
                  Number(
                    subscription
                      .payment
                      ?.amount ||
                      subscription
                        .priceSnapshot ||
                      0
                  );

                const refunded =
                  Number(
                    subscription
                      .payment
                      ?.refundedAmountPaise ||
                      0
                  ) /
                  100;

                return (
                  <div
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-[18px] border-t border-[#ddd0c1] py-4 max-[900px]:grid-cols-[1fr_auto] max-[520px]:grid-cols-1"
                    key={
                      subscription._id
                    }
                  >
                    <div>
                      <strong className="block text-[11px]">
                        {subscription
                          .user
                          ?.email ||
                          'Unknown member'}
                      </strong>

                      <small className="mt-1 block text-[9px] text-[#756a60]">
                        {subscription
                          .plan
                          ?.name ||
                          subscription
                            .planNameSnapshot ||
                          'Historical plan'}
                      </small>
                    </div>

                    <div className="text-[10px]">
                      <strong className="block">
                        {
                          subscription.status
                        }
                      </strong>

                      <small className="text-[#756a60]">
                        Ends{' '}
                        {subscription
                          .endsAt
                          ? formatDate(
                              subscription
                                .endsAt
                            )
                          : '—'}
                      </small>
                    </div>

                    <div className="text-[10px]">
                      <strong className="block">
                        {subscription
                          .payment
                          ?.status ||
                          'No payment'}
                      </strong>

                      <small className="text-[#756a60]">
                        Payment
                      </small>
                    </div>

                    <div className="text-right max-[520px]:text-left">
                      <strong className="block font-['Cormorant_Garamond'] text-[20px] font-medium">
                        {formatCurrency(
                          paidAmount
                        )}
                      </strong>

                      {refunded >
                        0 && (
                        <small className="text-[9px] text-[#681d25]">
                          Refunded{' '}
                          {formatCurrency(
                            refunded
                          )}
                        </small>
                      )}
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No subscriptions yet.
            </p>
          )}
        </section>
      )}
    </Async>
  );
}

export default function AdminPage() {
  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <Routes>
          <Route
            index
            element={
              <Overview />
            }
          />

          <Route
            path="profiles"
            element={
              <Queue />
            }
          />

          <Route
            path="profiles/:id"
            element={
              <Review />
            }
          />

          <Route
            path="users"
            element={
              <Users />
            }
          />

          <Route
            path="reports"
            element={
              <Reports />
            }
          />

          <Route
            path="subscriptions"
            element={
              <Subscriptions />
            }
          />
        </Routes>
      </main>
    </div>
  );
}