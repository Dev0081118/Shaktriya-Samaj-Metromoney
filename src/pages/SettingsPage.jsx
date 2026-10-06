import {
  useEffect,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const csv = (value) =>
  Array.isArray(value)
    ? value.join(', ')
    : value || '';

const arrays = (value) =>
  String(value || '')
    .split(',')
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);

const privacyOptions = {
  photoVisibility: [
    'Everyone',
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],

  contactVisibility: [
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ],

  incomeVisibility: [
    'Everyone',
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],

  familyVisibility: [
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],

  familyOverviewVisibility: [
    'RegisteredMembers',
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ],

  maternalFamilyVisibility: [
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ],

  siblingDetailsVisibility: [
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ],

  assetVisibility: [
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ],

  fullNameVisibility: [
    'Everyone',
    'RegisteredMembers'
  ]
};

const labelClass =
  'grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const formClass =
  'grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px]';

const formTitleClass =
  "font-['Cormorant_Garamond'] text-[35px] font-medium";

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white';

const textLinkClass =
  'border-b border-[#c49b70] pb-[3px] text-[12px] font-extrabold text-[#681d25]';

export default function SettingsPage({
  section
}) {
  const [form, setForm] =
    useState({});

  const [profile, setProfile] =
    useState(null);

  const [blocks, setBlocks] =
    useState([]);

  const [
    notifications,
    setNotifications
  ] = useState({});

  const [tab, setTab] =
    useState(
      section
        ? 'Preferences'
        : 'Privacy'
    );

  const [loading, setLoading] =
    useState(true);

  const {
    user,
    logout
  } = useAuth();

  const notify = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (section) {
      api('/preferences')
        .then((response) =>
          setForm(
            response.data.preferences
          )
        )
        .catch((error) =>
          notify(
            error.message,
            'error'
          )
        )
        .finally(() =>
          setLoading(false)
        );

      return;
    }

    Promise.all([
      api('/profiles/me'),
      api('/blocks'),
      api(
        '/notification-preferences'
      )
    ])
      .then(
        ([
          profileResult,
          blockResult,
          notificationResult
        ]) => {
          setProfile(
            profileResult.data.profile
          );

          setForm(
            profileResult.data.profile
              .privacy || {}
          );

          setBlocks(
            blockResult.data.blocks ||
              []
          );

          setNotifications(
            notificationResult.data
              .preferences || {}
          );
        }
      )
      .catch((error) =>
        notify(
          error.message,
          'error'
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, [
    section,
    notify
  ]);

  const update = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      if (section) {
        const payload = {
          ...form
        };

        [
          'locations',
          'states',
          'countries',
          'educationPreferences',
          'occupationPreferences',
          'dietPreferences',
          'communityPreferences',
          'marriageTimeline',
          'maritalStatus',
          'acceptedMaritalStatuses'
        ].forEach((key) => {
          if (
            typeof payload[key] ===
            'string'
          ) {
            payload[key] =
              arrays(payload[key]);
          }
        });

        await api('/preferences', {
          method: 'PUT',
          body: JSON.stringify(
            payload
          )
        });
      } else {
        await api(
          '/profiles/privacy',
          {
            method: 'PATCH',
            body: JSON.stringify(
              form
            )
          }
        );
      }

      notify(
        section
          ? 'Preferences saved.'
          : 'Privacy updated.'
      );
    } catch (error) {
      notify(
        error.message,
        'error'
      );
    }
  };

  const password = async (
    event
  ) => {
    event.preventDefault();

    try {
      await api(
        '/auth/change-password',
        {
          method: 'PATCH',
          body: JSON.stringify({
            currentPassword:
              event.currentTarget
                .current.value,

            newPassword:
              event.currentTarget
                .next.value
          })
        }
      );

      event.currentTarget.reset();

      notify(
        'Password changed.'
      );
    } catch (error) {
      notify(
        error.message,
        'error'
      );
    }
  };

  const lifecycle = async (
    status
  ) => {
    try {
      const result = await api(
        '/profiles/lifecycle',
        {
          method: 'PATCH',
          body: JSON.stringify({
            status
          })
        }
      );

      setProfile((current) => ({
        ...current,
        visibility:
          result.data.visibility,
        lifecycleStatus:
          result.data.status
      }));

      notify(result.message);
    } catch (error) {
      notify(
        error.message,
        'error'
      );
    }
  };

  const saveNotifications =
    async (event) => {
      event.preventDefault();

      try {
        await api(
          '/notification-preferences',
          {
            method: 'PUT',
            body: JSON.stringify(
              notifications
            )
          }
        );

        notify(
          'Notification preferences saved.'
        );
      } catch (error) {
        notify(
          error.message,
          'error'
        );
      }
    };

  const removeAccount =
    async () => {
      if (
        !window.confirm(
          'Close this account and remove the profile from discovery? This cannot be undone from the app.'
        )
      ) {
        return;
      }

      try {
        await api('/auth/account', {
          method: 'DELETE'
        });

        await logout();

        navigate('/');
      } catch (error) {
        notify(
          error.message,
          'error'
        );
      }
    };

  if (loading) {
    return (
      <div className="page-skeleton">
        Loading settings…
      </div>
    );
  }

  return (
    <>
      <header className="mb-[30px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Your account
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          {section
            ? 'Partner preferences'
            : 'Settings & privacy'}
        </h1>

        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          Choose what feels
          comfortable. Sensitive
          information is filtered by
          the server.
        </p>
      </header>

      {section ? (
        <form
          className={formClass}
          onSubmit={save}
        >
          <h2 className={formTitleClass}>
            The person you hope to meet
          </h2>

          <label className={labelClass}>
            Preferred gender

            <select
              className={fieldClass}
              value={
                form.preferredGender ||
                ''
              }
              onChange={(event) =>
                update(
                  'preferredGender',
                  event.target.value
                )
              }
            >
              <option value="">
                Select
              </option>

              <option>
                Female
              </option>

              <option>
                Male
              </option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
            {[
              [
                'ageMin',
                'Minimum age'
              ],
              [
                'ageMax',
                'Maximum age'
              ],
              [
                'heightMin',
                'Minimum height'
              ],
              [
                'heightMax',
                'Maximum height'
              ]
            ].map(
              ([key, label]) => (
                <label
                  key={key}
                  className={
                    labelClass
                  }
                >
                  {label}

                  <input
                    className={
                      fieldClass
                    }
                    type="number"
                    value={
                      form[key] ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        key,
                        Number(
                          event.target
                            .value
                        ) || ''
                      )
                    }
                  />
                </label>
              )
            )}
          </div>

          {[
            [
              'locations',
              'Preferred cities'
            ],
            [
              'states',
              'Preferred states'
            ],
            [
              'educationPreferences',
              'Education'
            ],
            [
              'occupationPreferences',
              'Occupations'
            ],
            [
              'dietPreferences',
              'Diet'
            ],
            [
              'communityPreferences',
              'Communities'
            ]
          ].map(
            ([key, label]) => (
              <label
                key={key}
                className={
                  labelClass
                }
              >
                {label}

                <input
                  className={
                    fieldClass
                  }
                  value={csv(
                    form[key]
                  )}
                  onChange={(
                    event
                  ) =>
                    update(
                      key,
                      event.target
                        .value
                    )
                  }
                  placeholder="Comma separated"
                />
              </label>
            )
          )}

          <label className={labelClass}>
            Accepted marital statuses

            <input
              className={fieldClass}
              value={csv(
                form.acceptedMaritalStatuses
              )}
              onChange={(event) =>
                update(
                  'acceptedMaritalStatuses',
                  event.target.value
                )
              }
              placeholder="Never Married, Divorced, Widowed"
            />
          </label>

          <label className={labelClass}>
            Willing to consider
            remarriage

            <select
              className={fieldClass}
              value={
                form.willingForRemarriage ||
                'Open to Discuss'
              }
              onChange={(event) =>
                update(
                  'willingForRemarriage',
                  event.target.value
                )
              }
            >
              <option>Yes</option>
              <option>No</option>
              <option>
                Open to Discuss
              </option>
            </select>
          </label>

          <button
            className={
              primaryButtonClass
            }
          >
            Save preferences
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-[220px_1fr] gap-10 max-[767px]:grid-cols-1">
          <nav className="grid content-start">
            {[
              'Privacy',
              'Account',
              'Password',
              'Notifications',
              'Blocked profiles'
            ].map((item) => (
              <button
                className={`border-b border-[#ddd0c1] p-[14px] text-left text-[11px] ${
                  tab === item
                    ? 'bg-[#fffdf8] font-extrabold text-[#681d25]'
                    : ''
                }`}
                onClick={() =>
                  setTab(item)
                }
                key={item}
              >
                {item}
              </button>
            ))}
          </nav>

          <div>
            {tab === 'Privacy' && (
              <form
                className={
                  formClass
                }
                onSubmit={save}
              >
                <h2
                  className={
                    formTitleClass
                  }
                >
                  Privacy controls
                </h2>

                {Object.entries(
                  privacyOptions
                ).map(
                  ([
                    key,
                    options
                  ]) => (
                    <label
                      key={key}
                      className={
                        labelClass
                      }
                    >
                      {key.replace(
                        /([A-Z])/g,
                        ' $1'
                      )}

                      <select
                        className={
                          fieldClass
                        }
                        value={
                          form[key] ||
                          ''
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            key,
                            event
                              .target
                              .value
                          )
                        }
                      >
                        {options.map(
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
                    </label>
                  )
                )}

                <button
                  className={
                    primaryButtonClass
                  }
                >
                  Save changes
                </button>
              </form>
            )}

            {tab === 'Account' && (
              <section className={formClass}>
                <h2 className={formTitleClass}>
                  Account & profile status
                </h2>

                <p className="text-[12px] text-[#756a60]">
                  {user.email} •{' '}
                  {user.phone ||
                    'No phone number'}
                </p>

                <p className="text-[12px] text-[#756a60]">
                  Current status:{' '}
                  {profile?.lifecycleStatus ||
                    'Active'}
                </p>

                <div className="mt-7 flex flex-wrap gap-[10px]">
                  <button
                    onClick={() =>
                      lifecycle(
                        profile?.lifecycleStatus ===
                          'Paused'
                          ? 'Active'
                          : 'Paused'
                      )
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    {profile?.lifecycleStatus ===
                    'Paused'
                      ? 'Resume profile'
                      : 'Pause profile'}
                  </button>

                  <button
                    onClick={() =>
                      lifecycle(
                        'Married'
                      )
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    We found a match /
                    Got married
                  </button>
                </div>

                <div className="mt-[35px] border-t border-[#d5b8b3] pt-[25px]">
                  <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium text-[#681d25]">
                    Delete account
                  </h3>

                  <p className="mb-[18px] mt-2 text-[12px] text-[#756a60]">
                    Your profile is hidden
                    immediately and
                    identifying login data is
                    anonymized.
                  </p>

                  <button
                    onClick={
                      removeAccount
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    Delete account
                  </button>
                </div>
              </section>
            )}

            {tab === 'Password' && (
              <form
                className={
                  formClass
                }
                onSubmit={password}
              >
                <h2
                  className={
                    formTitleClass
                  }
                >
                  Change password
                </h2>

                <label
                  className={
                    labelClass
                  }
                >
                  Current password

                  <input
                    className={
                      fieldClass
                    }
                    name="current"
                    type="password"
                    required
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  New password

                  <input
                    className={
                      fieldClass
                    }
                    name="next"
                    type="password"
                    minLength="8"
                    required
                  />
                </label>

                <button
                  className={
                    primaryButtonClass
                  }
                >
                  Change password
                </button>
              </form>
            )}

            {tab ===
              'Notifications' && (
              <form
                className={
                  formClass
                }
                onSubmit={
                  saveNotifications
                }
              >
                <h2
                  className={
                    formTitleClass
                  }
                >
                  Notification preferences
                </h2>

                {[
                  [
                    'emailInterests',
                    'Email for interests'
                  ],
                  [
                    'emailMatches',
                    'Email for matches'
                  ],
                  [
                    'emailPayments',
                    'Email for payments'
                  ],
                  [
                    'smsCritical',
                    'SMS for critical updates'
                  ],
                  [
                    'whatsappFuture',
                    'Allow future WhatsApp updates'
                  ]
                ].map(
                  ([
                    key,
                    label
                  ]) => (
                    <label
                      className="flex items-center gap-2 text-[11px] text-[#5e4e46]"
                      key={key}
                    >
                      <input
                        type="checkbox"
                        checked={
                          !!notifications[
                            key
                          ]
                        }
                        onChange={(
                          event
                        ) =>
                          setNotifications(
                            (
                              current
                            ) => ({
                              ...current,
                              [key]:
                                event
                                  .target
                                  .checked
                            })
                          )
                        }
                      />

                      {label}
                    </label>
                  )
                )}

                <button
                  className={
                    primaryButtonClass
                  }
                >
                  Save preferences
                </button>
              </form>
            )}

            {tab ===
              'Blocked profiles' && (
              <section
                className={
                  formClass
                }
              >
                <h2
                  className={
                    formTitleClass
                  }
                >
                  Blocked profiles
                </h2>

                {blocks.length ? (
                  blocks.map(
                    (block) => (
                      <div
                        className="flex justify-between border-b border-[#ddd0c1] py-[10px]"
                        key={
                          block._id
                        }
                      >
                        <span>
                          {
                            block
                              .blockedProfile
                              ?.firstName
                          }
                        </span>

                        <button
                          className={
                            textLinkClass
                          }
                          onClick={async () => {
                            await api(
                              `/blocks/${block.blockedProfile._id}`,
                              {
                                method:
                                  'DELETE'
                              }
                            );

                            setBlocks(
                              (
                                current
                              ) =>
                                current.filter(
                                  (
                                    item
                                  ) =>
                                    item._id !==
                                    block._id
                                )
                            );

                            notify(
                              'Profile unblocked.'
                            );
                          }}
                        >
                          Unblock
                        </button>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-[12px] text-[#756a60]">
                    No blocked profiles.
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}