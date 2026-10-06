import { useEffect, useState } from 'react';
import {
  Route,
  Routes,
  useNavigate,
  useParams
} from 'react-router-dom';

import AdminNav from '../../components/AdminNav';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  api,
  assetUrl
} from '../../services/api';
import {
  formatCurrency,
  formatDate
} from '../../utils/formatters';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:opacity-55";

const adminTableClass =
  "mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]";

const adminRowClass =
  "grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[auto_1fr_auto]";

const reportRowClass =
  "grid grid-cols-[1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4";

const metricCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const metricValueClass =
  "block font-['Cormorant_Garamond'] text-[34px] font-medium";

const metricLabelClass =
  "text-[9px] uppercase text-[#756a60]";

const operationCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-6";

function Async({ path, children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(path)
      .then((response) => setData(response.data))
      .catch((requestError) =>
        setError(requestError.message)
      );
  }, [path]);

  if (error) {
    return (
      <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-skeleton">
        Loading administration data…
      </div>
    );
  }

  return children(data, setData);
}

function Overview() {
  return (
    <Async path="/admin/dashboard">
      {(data) => (
        <>
          <header className="mb-[30px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              Operations control center
            </p>

            <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
              Business overview
            </h1>
          </header>

          <div className="grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-2">
            {[
              [
                data.customers.total,
                'Total customers'
              ],
              [
                data.profiles.active || 0,
                'Active profiles'
              ],
              [
                data.subscriptions.active,
                'Paid members'
              ],
              ...(data.finance
                ? [
                    [
                      formatCurrency(
                        data.finance.capturedRevenue
                      ),
                      'Captured revenue'
                    ]
                  ]
                : []),
              [
                data.supportSafety.pendingModeration,
                'Pending moderation'
              ],
              [
                data.supportSafety.openReports,
                'Open reports'
              ],
              [
                data.supportSafety.openSupport,
                'Support tickets'
              ],
              [
                data.subscriptions.expiringIn7Days,
                'Expiring in 7 days'
              ]
            ].map(([value, label]) => (
              <article
                className={metricCardClass}
                key={label}
              >
                <strong className={metricValueClass}>
                  {value}
                </strong>

                <span className={metricLabelClass}>
                  {label}
                </span>
              </article>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
            <section className={operationCardClass}>
              <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                Customer acquisition
              </h2>

              <div className="grid gap-3">
                {[
                  ['Today', data.customers.today],
                  ['This week', data.customers.week],
                  ['This month', data.customers.month],
                  ['Verified', data.customers.verified]
                ].map(([label, value]) => (
                  <span
                    key={label}
                    className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-2"
                  >
                    {label}

                    <strong>{value}</strong>
                  </span>
                ))}
              </div>
            </section>

            <section className={operationCardClass}>
              <h2 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                Matrimonial activity
              </h2>

              <div className="grid gap-3">
                {[
                  [
                    'Interests',
                    data.matrimonial.interests
                  ],
                  [
                    'Pending',
                    data.matrimonial.pendingInterests
                  ],
                  [
                    'Matches',
                    data.matrimonial.matches
                  ],
                  [
                    'Contact unlocks',
                    data.matrimonial.contactUnlocks
                  ]
                ].map(([label, value]) => (
                  <span
                    key={label}
                    className="flex justify-between gap-5 border-b border-[#ddd0c1] pb-2"
                  >
                    {label}

                    <strong>{value}</strong>
                  </span>
                ))}
              </div>
            </section>
          </div>

          <Queue />
        </>
      )}
    </Async>
  );
}

function Queue() {
  const navigate = useNavigate();

  return (
    <Async path="/admin/profiles?status=pending_review">
      {(data) => (
        <section className={adminTableClass}>
          <div className="my-6 mt-[52px] flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                Queue
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
                Profiles awaiting review
              </h2>
            </div>
          </div>

          {data.profiles.length ? (
            data.profiles.map((profile) => (
              <div
                className={adminRowClass}
                key={profile._id}
              >
                <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                  {profile.firstName?.[0]}
                </span>

                <div>
                  <strong className="block text-[11px]">
                    {profile.firstName}{' '}
                    {profile.lastName}
                  </strong>

                  <small className="block text-[9px] text-[#756a60]">
                    {profile.profileId} •{' '}
                    {profile.location?.city}
                  </small>
                </div>

                <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                  {formatDate(profile.createdAt)}
                </time>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/profiles/${profile._id}`
                    )
                  }
                  className={outlineButtonClass}
                >
                  Review
                </button>
              </div>
            ))
          ) : (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No pending profiles.
            </p>
          )}
        </section>
      )}
    </Async>
  );
}

function Review() {
  const { id } = useParams();

  const notify = useToast();
  const navigate = useNavigate();

  const [notes, setNotes] = useState('');

  return (
    <Async path={`/admin/profiles/${id}`}>
      {(data) => {
        const profile = data.profile;

        const act = async (action) => {
          try {
            await api(
              `/admin/profiles/${id}/${action}`,
              {
                method: 'PATCH',
                body: JSON.stringify({
                  notes
                })
              }
            );

            notify(
              'Moderation decision saved.'
            );

            navigate('/admin/profiles');
          } catch (error) {
            notify(
              error.message,
              'error'
            );
          }
        };

        return (
          <article className="max-w-[850px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[767px]:p-5">
            <header className="flex items-center gap-[30px] max-[767px]:items-start">
              {profile.profilePhoto && (
                <img
                  src={assetUrl(
                    profile.profilePhoto
                  )}
                  alt=""
                  className="h-[190px] w-[150px] object-cover max-[767px]:h-[120px] max-[767px]:w-[90px]"
                />
              )}

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                  {profile.profileId}
                </p>

                <h1 className="font-['Cormorant_Garamond'] text-[48px] font-medium max-[767px]:text-[36px]">
                  {profile.firstName}{' '}
                  {profile.lastName}
                </h1>

                <p>
                  {profile.location?.city},{' '}
                  {profile.location?.state} •{' '}
                  {profile.visibility}
                </p>
              </div>
            </header>

            <section className="py-[30px]">
              <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
                Profile details
              </h2>

              <p>
                {profile.aboutMe ||
                  'No introduction supplied.'}
              </p>

              <dl className="mt-5 grid grid-cols-3 max-[767px]:grid-cols-2">
                <div>
                  <dt className="text-[8px] uppercase text-[#756a60]">
                    Education
                  </dt>

                  <dd className="font-['Cormorant_Garamond'] text-[20px] font-medium">
                    {
                      profile.education
                        ?.highestEducation
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-[8px] uppercase text-[#756a60]">
                    Occupation
                  </dt>

                  <dd className="font-['Cormorant_Garamond'] text-[20px] font-medium">
                    {
                      profile.career
                        ?.occupation
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-[8px] uppercase text-[#756a60]">
                    Community
                  </dt>

                  <dd className="font-['Cormorant_Garamond'] text-[20px] font-medium">
                    {
                      profile.community
                        ?.name
                    }
                  </dd>
                </div>
              </dl>
            </section>

            <label className="grid gap-2 text-[10px] uppercase tracking-[0.1em]">
              Moderation notes

              <textarea
                rows="4"
                className="border border-[#ddd0c1] bg-white p-[13px]"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
              />
            </label>

            <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
              <button
                onClick={() =>
                  act('approve')
                }
                className={primaryButtonClass}
              >
                Approve
              </button>

              <button
                onClick={() =>
                  act('changes')
                }
                className={outlineButtonClass}
              >
                Request changes
              </button>

              <button
                onClick={() =>
                  act('reject')
                }
                className={outlineButtonClass}
              >
                Reject
              </button>

              <button
                onClick={() =>
                  act('suspend')
                }
                className={outlineButtonClass}
              >
                Suspend
              </button>
            </div>
          </article>
        );
      }}
    </Async>
  );
}

function Users() {
  const notify = useToast();
  const { user } = useAuth();

  const change = async (
    target,
    patch,
    setData
  ) => {
    try {
      const result = await api(
        `/admin/users/${target._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch)
        }
      );

      setData((current) => ({
        ...current,
        users: current.users.map(
          (item) =>
            item._id === target._id
              ? result.data.user
              : item
        )
      }));

      notify('User access updated.');
    } catch (error) {
      notify(
        error.message,
        'error'
      );
    }
  };

  return (
    <Async path="/admin/users">
      {(data, setData) => (
        <section className={adminTableClass}>
          <div className="my-6 mt-[52px] flex items-end justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
              Members and staff
            </h2>
          </div>

          {data.users.map((member) => (
            <div
              className={adminRowClass}
              key={member._id}
            >
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                {member.email?.[0].toUpperCase()}
              </span>

              <div>
                <strong className="block text-[11px]">
                  {member.email}
                </strong>

                <small className="block text-[9px] text-[#756a60]">
                  {member.phone} • {member.role}
                </small>
              </div>

              <select
                className="border border-[#ddd0c1] bg-white p-[10px]"
                value={member.status}
                onChange={(event) =>
                  change(
                    member,
                    {
                      status:
                        event.target.value
                    },
                    setData
                  )
                }
              >
                {[
                  'Active',
                  'Suspended',
                  'Blocked'
                ].map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>

              {user?.role ===
                'super_admin' && (
                <select
                  aria-label={`Role for ${member.email}`}
                  className="border border-[#ddd0c1] bg-white p-[10px]"
                  value={member.role}
                  onChange={(event) =>
                    change(
                      member,
                      {
                        role:
                          event.target.value
                      },
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
                  ].map((role) => (
                    <option key={role}>
                      {role}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </section>
      )}
    </Async>
  );
}

function Reports() {
  const notify = useToast();

  return (
    <Async path="/admin/reports">
      {(data, setData) => (
        <section className={adminTableClass}>
          <div className="my-6 mt-[52px] flex items-end justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
              Member reports
            </h2>
          </div>

          {data.reports.length ? (
            data.reports.map((report) => (
              <div
                className={reportRowClass}
                key={report._id}
              >
                <div>
                  <strong className="block text-[11px]">
                    {report.reason}:{' '}
                    {
                      report.reportedProfile
                        ?.firstName
                    }
                  </strong>

                  <small className="block text-[9px] text-[#756a60]">
                    {report.description} •
                    reported by{' '}
                    {report.reporter?.email}
                  </small>
                </div>

                <time className="text-[9px] text-[#756a60]">
                  {report.status}
                </time>

                <select
                  className="border border-[#ddd0c1] bg-white p-[10px]"
                  value={report.status}
                  onChange={async (event) => {
                    try {
                      const result =
                        await api(
                          `/admin/reports/${report._id}`,
                          {
                            method:
                              'PATCH',
                            body:
                              JSON.stringify(
                                {
                                  status:
                                    event
                                      .target
                                      .value
                                }
                              )
                          }
                        );

                      setData(
                        (current) => ({
                          ...current,
                          reports:
                            current.reports.map(
                              (item) =>
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
                    } catch (error) {
                      setData(
                        (current) => ({
                          ...current
                        })
                      );

                      notify(
                        error.message,
                        'error'
                      );
                    }
                  }}
                >
                  {[
                    'Open',
                    'Reviewed',
                    'Resolved',
                    'Dismissed'
                  ].map((status) => (
                    <option
                      key={status}
                      disabled={
                        status === 'Open'
                      }
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No reports.
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
      {(data) => (
        <section className={adminTableClass}>
          <div className="my-6 mt-[52px] flex items-end justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
              Subscriptions
            </h2>
          </div>

          {data.subscriptions.length ? (
            data.subscriptions.map(
              (subscription) => (
                <div
                  className={adminRowClass}
                  key={subscription._id}
                >
                  <div>
                    <strong className="block text-[11px]">
                      {
                        subscription.user
                          ?.email
                      }
                    </strong>

                    <small className="block text-[9px] text-[#756a60]">
                      {
                        subscription.plan
                          ?.name
                      }
                    </small>
                  </div>

                  <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                    {subscription.status}
                  </time>

                  <span>
                    {subscription.payment
                      ?.status ||
                      'No payment'}
                  </span>
                </div>
              )
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
            element={<Overview />}
          />

          <Route
            path="profiles"
            element={<Queue />}
          />

          <Route
            path="profiles/:id"
            element={<Review />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="subscriptions"
            element={<Subscriptions />}
          />
        </Routes>
      </main>
    </div>
  );
}