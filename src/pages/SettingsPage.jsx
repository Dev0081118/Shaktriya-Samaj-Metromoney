import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

import {
  useToast
} from '../context/ToastContext';

import {
  api
} from '../services/api';

const IMPORTANCE_OPTIONS = [
  'Low',
  'Medium',
  'High',
  'Must Have'
];

const csv = (
  value
) =>
  Array.isArray(
    value
  )
    ? value.join(
        ', '
      )
    : value ||
      '';

const arrays = (
  value
) =>
  String(
    value ||
      ''
  )
    .split(',')
    .map(
      (
        item
      ) =>
        item.trim()
    )
    .filter(
      Boolean
    );

const privacyOptions = {
  fullNameVisibility: [
    'Everyone',
    'RegisteredMembers'
  ],

  photoVisibility: [
    'Everyone',
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],

  incomeVisibility: [
    'Everyone',
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

  astrologyVisibility: [
    'RegisteredMembers',
    'AcceptedInterests',
    'MutualMatches',
    'Private'
  ]
};

const privacyLabels = {
  fullNameVisibility:
    'Full name',

  photoVisibility:
    'Profile photos',

  incomeVisibility:
    'Annual income',

  familyOverviewVisibility:
    'Family details',

  maternalFamilyVisibility:
    'Mosal / maternal family',

  siblingDetailsVisibility:
    'Sibling details',

  assetVisibility:
    'Family assets',

  astrologyVisibility:
    'Birth & horoscope'
};

const labelClass =
  'grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const formClass =
  'grid gap-[24px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[600px]:p-[22px]';

const formTitleClass =
  "font-['Cormorant_Garamond'] text-[35px] font-medium";

const sectionTitleClass =
  "font-['Cormorant_Garamond'] text-[28px] font-medium text-[#431318]";

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white';

const textLinkClass =
  'border-b border-[#c49b70] pb-[3px] text-[12px] font-extrabold text-[#681d25]';

const preferenceSectionClass =
  'grid gap-5 border border-[#e2d5c7] bg-[#faf6f0] p-5';

function ImportanceSelect({
  value,
  onChange
}) {
  return (
    <label
      className={
        labelClass
      }
    >
      Importance

      <select
        className={
          fieldClass
        }
        value={
          value ||
          'Medium'
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      >
        {IMPORTANCE_OPTIONS.map(
          (
            option
          ) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function RangePreference({
  title,
  minLabel,
  maxLabel,
  min,
  max,
  minLimit,
  maxLimit,
  unit,
  importance,
  onMin,
  onMax,
  onImportance
}) {
  return (
    <section
      className={
        preferenceSectionClass
      }
    >
      <div>
        <h3
          className={
            sectionTitleClass
          }
        >
          {title}
        </h3>

        {unit && (
          <p className="mt-1 text-[10px] text-[#8b7d72]">
            Values are entered in{' '}
            {unit}.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
        <label
          className={
            labelClass
          }
        >
          {minLabel}

          <input
            className={
              fieldClass
            }
            type="number"
            min={
              minLimit
            }
            max={
              maxLimit
            }
            value={
              min ??
              ''
            }
            onChange={(
              event
            ) =>
              onMin(
                event.target.value
              )
            }
          />
        </label>

        <label
          className={
            labelClass
          }
        >
          {maxLabel}

          <input
            className={
              fieldClass
            }
            type="number"
            min={
              minLimit
            }
            max={
              maxLimit
            }
            value={
              max ??
              ''
            }
            onChange={(
              event
            ) =>
              onMax(
                event.target.value
              )
            }
          />
        </label>

        <ImportanceSelect
          value={
            importance
          }
          onChange={
            onImportance
          }
        />
      </div>
    </section>
  );
}

function CsvPreference({
  title,
  label,
  value,
  placeholder,
  importance,
  onChange,
  onImportance
}) {
  return (
    <section
      className={
        preferenceSectionClass
      }
    >
      <h3
        className={
          sectionTitleClass
        }
      >
        {title}
      </h3>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
        <label
          className={
            labelClass
          }
        >
          {label}

          <input
            className={
              fieldClass
            }
            value={
              csv(
                value
              )
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target.value
              )
            }
            placeholder={
              placeholder
            }
          />
        </label>

        <ImportanceSelect
          value={
            importance
          }
          onChange={
            onImportance
          }
        />
      </div>
    </section>
  );
}

function PropertyPreference({
  label,
  value,
  importance,
  onChange,
  onImportance
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
      <label
        className={
          labelClass
        }
      >
        {label}

        <select
          className={
            fieldClass
          }
          value={
            value ||
            'Any'
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        >
          <option value="Any">
            No preference
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>
        </select>
      </label>

      <ImportanceSelect
        value={
          importance
        }
        onChange={
          onImportance
        }
      />
    </div>
  );
}

export default function SettingsPage({
  section
}) {
  const [
    form,
    setForm
  ] =
    useState({});

  const [
    profile,
    setProfile
  ] =
    useState(
      null
    );

  const [
    blocks,
    setBlocks
  ] =
    useState([]);

  const [
    notifications,
    setNotifications
  ] =
    useState({});

  const [
    tab,
    setTab
  ] =
    useState(
      section
        ? 'Preferences'
        : 'Privacy'
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving
  ] =
    useState(
      false
    );

  const {
    user,
    logout
  } =
    useAuth();

  const notify =
    useToast();

  const navigate =
    useNavigate();

  useEffect(
    () => {
      /*
       * Do NOT call setLoading(true) synchronously here.
       *
       * Initial loading state is already true and the
       * React lint rule rejects synchronous setState at
       * the beginning of the effect.
       */
      if (
        section
      ) {
        api(
          '/preferences'
        )
          .then(
            (
              response
            ) => {
              setForm(
                response.data
                  .preferences ||
                  {}
              );
            }
          )
          .catch(
            (
              error
            ) =>
              notify(
                error.message,
                'error'
              )
          )
          .finally(
            () =>
              setLoading(
                false
              )
          );

        return;
      }

      Promise.all([
        api(
          '/profiles/me'
        ),

        api(
          '/blocks'
        ),

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
              profileResult
                .data
                .profile
            );

            setForm(
              profileResult
                .data
                .profile
                .privacy ||
                {}
            );

            setBlocks(
              blockResult
                .data
                .blocks ||
                []
            );

            setNotifications(
              notificationResult
                .data
                .preferences ||
                {}
            );
          }
        )
        .catch(
          (
            error
          ) =>
            notify(
              error.message,
              'error'
            )
        )
        .finally(
          () =>
            setLoading(
              false
            )
        );
    },
    [
      section,
      notify
    ]
  );

  const update =
    (
      key,
      value
    ) => {
      setForm(
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

  const updateImportance =
    (
      key,
      value
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          importance: {
            ...(
              current.importance ||
              {}
            ),

            [
              key
            ]:
              value
          }
        })
      );
    };

  const updateIncome =
    (
      key,
      value
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          incomePreferences: {
            ...(
              current.incomePreferences ||
              {}
            ),

            [
              key
            ]:
              value
          }
        })
      );
    };

  const updateProperty =
    (
      key,
      value
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          propertyPreferences: {
            ownResidence:
              'Any',

            agricultureLand:
              'Any',

            businessAssets:
              'Any',

            ...(
              current.propertyPreferences ||
              {}
            ),

            [
              key
            ]:
              value
          }
        })
      );
    };

  const save =
    async (
      event
    ) => {
      event.preventDefault();

      setSaving(
        true
      );

      try {
        if (
          section
        ) {
          const payload = {
            ...form
          };

          const arrayFields = [
            'locations',
            'states',
            'countries',

            'shakhPreferences',
            'gotraPreferences',
            'vanshPreferences',

            'communityPreferences',

            'educationPreferences',
            'occupationPreferences',

            'dietPreferences',

            'familyTypePreferences',
            'familyValuePreferences',

            'smokingPreferences',
            'drinkingPreferences',

            'marriageTimeline',

            'maritalStatus',
            'acceptedMaritalStatuses'
          ];

          arrayFields.forEach(
            (
              key
            ) => {
              if (
                typeof payload[
                  key
                ] ===
                'string'
              ) {
                payload[
                  key
                ] =
                  arrays(
                    payload[
                      key
                    ]
                  );
              }
            }
          );

          const numericFields = [
            'ageMin',
            'ageMax',
            'heightMin',
            'heightMax',
            'weightMin',
            'weightMax'
          ];

          numericFields.forEach(
            (
              key
            ) => {
              if (
                payload[
                  key
                ] ===
                  '' ||
                payload[
                  key
                ] ===
                  null
              ) {
                delete payload[
                  key
                ];
              } else if (
                payload[
                  key
                ] !==
                undefined
              ) {
                payload[
                  key
                ] =
                  Number(
                    payload[
                      key
                    ]
                  );
              }
            }
          );

          if (
            payload.incomePreferences
          ) {
            const min =
              payload
                .incomePreferences
                .min;

            const max =
              payload
                .incomePreferences
                .max;

            payload.incomePreferences = {
              ...(min !==
                '' &&
              min !==
                null &&
              min !==
                undefined
                ? {
                    min:
                      Number(
                        min
                      )
                  }
                : {}),

              ...(max !==
                '' &&
              max !==
                null &&
              max !==
                undefined
                ? {
                    max:
                      Number(
                        max
                      )
                  }
                : {})
            };
          }

          await api(
            '/preferences',
            {
              method:
                'PUT',

              body:
                JSON.stringify(
                  payload
                )
            }
          );

          notify(
            'Matching preferences saved.'
          );
        } else {
          const privacyPayload =
            Object.fromEntries(
              Object.keys(
                privacyOptions
              )
                .filter(
                  (
                    key
                  ) =>
                    form[
                      key
                    ] !==
                    undefined
                )
                .map(
                  (
                    key
                  ) => [
                    key,
                    form[
                      key
                    ]
                  ]
                )
            );

          privacyPayload.contactAddressVisibility =
            'Private';

          await api(
            '/profiles/privacy',
            {
              method:
                'PATCH',

              body:
                JSON.stringify(
                  privacyPayload
                )
            }
          );

          notify(
            'Privacy updated.'
          );
        }
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const password =
    async (
      event
    ) => {
      event.preventDefault();

      try {
        await api(
          '/auth/change-password',
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                currentPassword:
                  event.currentTarget
                    .current
                    .value,

                newPassword:
                  event.currentTarget
                    .next
                    .value
              })
          }
        );

        event.currentTarget
          .reset();

        notify(
          'Password changed.'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      }
    };

  const lifecycle =
    async (
      status
    ) => {
      try {
        const result =
          await api(
            '/profiles/lifecycle',
            {
              method:
                'PATCH',

              body:
                JSON.stringify({
                  status
                })
            }
          );

        setProfile(
          (
            current
          ) => ({
            ...current,

            visibility:
              result.data
                .visibility,

            lifecycleStatus:
              result.data
                .status
          })
        );

        notify(
          result.message
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      }
    };

  const saveNotifications =
    async (
      event
    ) => {
      event.preventDefault();

      try {
        await api(
          '/notification-preferences',
          {
            method:
              'PUT',

            body:
              JSON.stringify(
                notifications
              )
          }
        );

        notify(
          'Notification preferences saved.'
        );
      } catch (
        error
      ) {
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
        await api(
          '/auth/account',
          {
            method:
              'DELETE'
          }
        );

        await logout();

        navigate(
          '/'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      }
    };

  if (
    loading
  ) {
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

        <p className="mt-[18px] max-w-[720px] text-[14px] leading-[1.8] text-[#756a60]">
          {section
            ? 'Tell us what matters to you. These preferences are used by your personal recommendation engine.'
            : 'Choose what feels comfortable. Sensitive information is filtered by the server.'}
        </p>
      </header>

      {section ? (
        <form
          className={
            formClass
          }
          onSubmit={
            save
          }
        >
          <section className="grid gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#91683f]">
                Matching preferences
              </p>

              <h2
                className={
                  formTitleClass
                }
              >
                The person you hope to meet
              </h2>

              <p className="mt-2 max-w-[720px] text-[11px] leading-6 text-[#756a60]">
                Your match percentage is personal to you.
                The same member may receive a different
                percentage when they view your profile,
                because their preferences are evaluated
                separately.
              </p>
            </div>

            <label
              className={
                labelClass
              }
            >
              Preferred gender

              <select
                className={
                  fieldClass
                }
                value={
                  form.preferredGender ||
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'preferredGender',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Male">
                  Male
                </option>
              </select>
            </label>
          </section>

          <RangePreference
            title="Age preference"
            minLabel="Minimum age"
            maxLabel="Maximum age"
            min={
              form.ageMin
            }
            max={
              form.ageMax
            }
            minLimit={
              18
            }
            maxLimit={
              80
            }
            importance={
              form.importance
                ?.age
            }
            onMin={(
              value
            ) =>
              update(
                'ageMin',
                value
              )
            }
            onMax={(
              value
            ) =>
              update(
                'ageMax',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'age',
                value
              )
            }
          />

          <RangePreference
            title="Height preference"
            minLabel="Minimum height"
            maxLabel="Maximum height"
            min={
              form.heightMin
            }
            max={
              form.heightMax
            }
            minLimit={
              100
            }
            maxLimit={
              250
            }
            unit="centimetres"
            importance={
              form.importance
                ?.height
            }
            onMin={(
              value
            ) =>
              update(
                'heightMin',
                value
              )
            }
            onMax={(
              value
            ) =>
              update(
                'heightMax',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'height',
                value
              )
            }
          />

          <RangePreference
            title="Body weight preference"
            minLabel="Minimum weight"
            maxLabel="Maximum weight"
            min={
              form.weightMin
            }
            max={
              form.weightMax
            }
            minLimit={
              30
            }
            maxLimit={
              250
            }
            unit="kilograms"
            importance={
              form.importance
                ?.weight
            }
            onMin={(
              value
            ) =>
              update(
                'weightMin',
                value
              )
            }
            onMax={(
              value
            ) =>
              update(
                'weightMax',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'weight',
                value
              )
            }
          />

          <section
            className={
              preferenceSectionClass
            }
          >
            <h3
              className={
                sectionTitleClass
              }
            >
              Marital preference
            </h3>

            <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
              <label
                className={
                  labelClass
                }
              >
                Accepted marital statuses

                <input
                  className={
                    fieldClass
                  }
                  value={
                    csv(
                      form
                        .acceptedMaritalStatuses
                    )
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      'acceptedMaritalStatuses',
                      event.target.value
                    )
                  }
                  placeholder="Never Married, Divorced, Widowed"
                />
              </label>

              <ImportanceSelect
                value={
                  form.importance
                    ?.maritalStatus
                }
                onChange={(
                  value
                ) =>
                  updateImportance(
                    'maritalStatus',
                    value
                  )
                }
              />
            </div>

            <label
              className={
                labelClass
              }
            >
              Willing to consider remarriage

              <select
                className={
                  fieldClass
                }
                value={
                  form.willingForRemarriage ||
                  'Open to Discuss'
                }
                onChange={(
                  event
                ) =>
                  update(
                    'willingForRemarriage',
                    event.target.value
                  )
                }
              >
                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

                <option value="Open to Discuss">
                  Open to Discuss
                </option>
              </select>
            </label>
          </section>

          <section
            className={
              preferenceSectionClass
            }
          >
            <h3
              className={
                sectionTitleClass
              }
            >
              Native location
            </h3>

            <p className="text-[10px] leading-5 text-[#8b7d72]">
              Recommendations use only matrimonial/native
              location. Exact current residential address
              is never used by the matching engine.
            </p>

            <label
              className={
                labelClass
              }
            >
              Preferred native states

              <input
                className={
                  fieldClass
                }
                value={
                  csv(
                    form.states
                  )
                }
                onChange={(
                  event
                ) =>
                  update(
                    'states',
                    event.target.value
                  )
                }
                placeholder="Gujarat, Rajasthan"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Preferred native district / place

              <input
                className={
                  fieldClass
                }
                value={
                  csv(
                    form.locations
                  )
                }
                onChange={(
                  event
                ) =>
                  update(
                    'locations',
                    event.target.value
                  )
                }
                placeholder="Rajkot, Jamnagar, Udaipur"
              />
            </label>

            <ImportanceSelect
              value={
                form.importance
                  ?.location
              }
              onChange={(
                value
              ) =>
                updateImportance(
                  'location',
                  value
                )
              }
            />
          </section>

          <CsvPreference
            title="Surname / Shakh"
            label="Preferred Surname / Shakh"
            value={
              form.shakhPreferences
            }
            placeholder="Jadeja, Gohil, Jhala"
            importance={
              form.importance
                ?.shakh
            }
            onChange={(
              value
            ) =>
              update(
                'shakhPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'shakh',
                value
              )
            }
          />

          <CsvPreference
            title="Gotra"
            label="Preferred Gotra"
            value={
              form.gotraPreferences
            }
            placeholder="Enter one or multiple Gotras"
            importance={
              form.importance
                ?.gotra
            }
            onChange={(
              value
            ) =>
              update(
                'gotraPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'gotra',
                value
              )
            }
          />

          <CsvPreference
            title="Kul / Vansh"
            label="Preferred Kul / Vansh"
            value={
              form.vanshPreferences
            }
            placeholder="Suryavanshi, Chandravanshi"
            importance={
              form.importance
                ?.vansh
            }
            onChange={(
              value
            ) =>
              update(
                'vanshPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'vansh',
                value
              )
            }
          />

          <CsvPreference
            title="Education"
            label="Preferred education"
            value={
              form.educationPreferences
            }
            placeholder="B.E., MBA, MBBS"
            importance={
              form.importance
                ?.education
            }
            onChange={(
              value
            ) =>
              update(
                'educationPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'education',
                value
              )
            }
          />

          <CsvPreference
            title="Profession"
            label="Preferred occupation / profession"
            value={
              form.occupationPreferences
            }
            placeholder="Engineer, Doctor, Business"
            importance={
              form.importance
                ?.occupation
            }
            onChange={(
              value
            ) =>
              update(
                'occupationPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'occupation',
                value
              )
            }
          />

          <section
            className={
              preferenceSectionClass
            }
          >
            <h3
              className={
                sectionTitleClass
              }
            >
              Annual income
            </h3>

            <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
              <label
                className={
                  labelClass
                }
              >
                Minimum annual income

                <input
                  className={
                    fieldClass
                  }
                  type="number"
                  min="0"
                  value={
                    form
                      .incomePreferences
                      ?.min ??
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    updateIncome(
                      'min',
                      event.target.value
                    )
                  }
                />
              </label>

              <label
                className={
                  labelClass
                }
              >
                Maximum annual income

                <input
                  className={
                    fieldClass
                  }
                  type="number"
                  min="0"
                  value={
                    form
                      .incomePreferences
                      ?.max ??
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    updateIncome(
                      'max',
                      event.target.value
                    )
                  }
                />
              </label>

              <ImportanceSelect
                value={
                  form.importance
                    ?.income
                }
                onChange={(
                  value
                ) =>
                  updateImportance(
                    'income',
                    value
                  )
                }
              />
            </div>
          </section>

          <CsvPreference
            title="Diet"
            label="Preferred diet"
            value={
              form.dietPreferences
            }
            placeholder="Vegetarian, Jain"
            importance={
              form.importance
                ?.diet
            }
            onChange={(
              value
            ) =>
              update(
                'dietPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'diet',
                value
              )
            }
          />

          <CsvPreference
            title="Family type"
            label="Preferred family type"
            value={
              form.familyTypePreferences
            }
            placeholder="Joint, Nuclear"
            importance={
              form.importance
                ?.familyType
            }
            onChange={(
              value
            ) =>
              update(
                'familyTypePreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'familyType',
                value
              )
            }
          />

          <CsvPreference
            title="Family values"
            label="Preferred family values"
            value={
              form.familyValuePreferences
            }
            placeholder="Traditional, Moderate, Liberal"
            importance={
              form.importance
                ?.familyValues
            }
            onChange={(
              value
            ) =>
              update(
                'familyValuePreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'familyValues',
                value
              )
            }
          />

          <CsvPreference
            title="Smoking"
            label="Smoking preference"
            value={
              form.smokingPreferences
            }
            placeholder="Never, Occasionally"
            importance={
              form.importance
                ?.smoking
            }
            onChange={(
              value
            ) =>
              update(
                'smokingPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'smoking',
                value
              )
            }
          />

          <CsvPreference
            title="Drinking"
            label="Drinking preference"
            value={
              form.drinkingPreferences
            }
            placeholder="Never, Occasionally"
            importance={
              form.importance
                ?.drinking
            }
            onChange={(
              value
            ) =>
              update(
                'drinkingPreferences',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'drinking',
                value
              )
            }
          />

          <section
            className={
              preferenceSectionClass
            }
          >
            <div>
              <h3
                className={
                  sectionTitleClass
                }
              >
                Property & family assets
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-[#8b7d72]">
                These values are used internally for
                matching. Private property information is
                not revealed through the percentage.
              </p>
            </div>

            <PropertyPreference
              label="Own residential property"
              value={
                form
                  .propertyPreferences
                  ?.ownResidence
              }
              importance={
                form.importance
                  ?.ownResidence
              }
              onChange={(
                value
              ) =>
                updateProperty(
                  'ownResidence',
                  value
                )
              }
              onImportance={(
                value
              ) =>
                updateImportance(
                  'ownResidence',
                  value
                )
              }
            />

            <PropertyPreference
              label="Agricultural land"
              value={
                form
                  .propertyPreferences
                  ?.agricultureLand
              }
              importance={
                form.importance
                  ?.agricultureLand
              }
              onChange={(
                value
              ) =>
                updateProperty(
                  'agricultureLand',
                  value
                )
              }
              onImportance={(
                value
              ) =>
                updateImportance(
                  'agricultureLand',
                  value
                )
              }
            />

            <PropertyPreference
              label="Business assets"
              value={
                form
                  .propertyPreferences
                  ?.businessAssets
              }
              importance={
                form.importance
                  ?.businessAssets
              }
              onChange={(
                value
              ) =>
                updateProperty(
                  'businessAssets',
                  value
                )
              }
              onImportance={(
                value
              ) =>
                updateImportance(
                  'businessAssets',
                  value
                )
              }
            />
          </section>

          <CsvPreference
            title="Marriage timeline"
            label="Preferred marriage timeline"
            value={
              form.marriageTimeline
            }
            placeholder="Within 6 months, Within 1 year"
            importance={
              form.importance
                ?.marriageTimeline
            }
            onChange={(
              value
            ) =>
              update(
                'marriageTimeline',
                value
              )
            }
            onImportance={(
              value
            ) =>
              updateImportance(
                'marriageTimeline',
                value
              )
            }
          />

          <section
            className={
              preferenceSectionClass
            }
          >
            <h3
              className={
                sectionTitleClass
              }
            >
              Additional expectations
            </h3>

            <label
              className={
                labelClass
              }
            >
              Notes

              <textarea
                className={`${fieldClass} min-h-[130px] resize-y`}
                maxLength={
                  1500
                }
                value={
                  form.additionalPreferences ||
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'additionalPreferences',
                    event.target.value
                  )
                }
                placeholder="Any additional expectations you would like to record..."
              />
            </label>
          </section>

          <div className="border border-[#c9b18f] bg-[#c49b700b] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#681d25]">
              How importance works
            </p>

            <div className="mt-3 grid gap-2 text-[10px] leading-5 text-[#756a60]">
              <p>
                <strong>
                  Low:
                </strong>{' '}
                small influence on recommendation ranking.
              </p>

              <p>
                <strong>
                  Medium:
                </strong>{' '}
                normal matching importance.
              </p>

              <p>
                <strong>
                  High:
                </strong>{' '}
                strong influence on your percentage.
              </p>

              <p>
                <strong>
                  Must Have:
                </strong>{' '}
                candidate is excluded if the requirement
                fails or cannot be verified.
              </p>
            </div>
          </div>

          <button
            className={
              primaryButtonClass
            }
            disabled={
              saving
            }
          >
            {saving
              ? 'Saving…'
              : 'Save matching preferences'}
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
            ].map(
              (
                item
              ) => (
                <button
                  type="button"
                  className={`border-b border-[#ddd0c1] p-[14px] text-left text-[11px] ${
                    tab ===
                    item
                      ? 'bg-[#fffdf8] font-extrabold text-[#681d25]'
                      : ''
                  }`}
                  onClick={() =>
                    setTab(
                      item
                    )
                  }
                  key={
                    item
                  }
                >
                  {item}
                </button>
              )
            )}
          </nav>

          <div>
            {tab ===
              'Privacy' && (
              <form
                className={
                  formClass
                }
                onSubmit={
                  save
                }
              >
                <h2
                  className={
                    formTitleClass
                  }
                >
                  Privacy controls
                </h2>

                <p className="text-[11px] leading-6 text-[#756a60]">
                  Phone, email and your exact current
                  residential address remain private.
                  They are shared only with a specific
                  member after the contact access request
                  is approved and explicitly unlocked.
                  A mutual match alone does not expose
                  them. Exact date of birth is also hidden.
                </p>

                {Object.entries(
                  privacyOptions
                ).map(
                  ([
                    key,
                    options
                  ]) => (
                    <label
                      key={
                        key
                      }
                      className={
                        labelClass
                      }
                    >
                      {
                        privacyLabels[
                          key
                        ] ||
                        key
                      }

                      <select
                        className={
                          fieldClass
                        }
                        value={
                          form[
                            key
                          ] ||
                          ''
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            key,
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Use default
                        </option>

                        {options.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  )
                )}

                <div className="border border-[#ddd0c1] bg-[#fffdf8] p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#91683f]">
                    Current Address
                  </p>

                  <p className="mt-2 text-[11px] leading-6 text-[#756a60]">
                    Your address has no automatic
                    visibility setting. You stay in
                    control by approving contact access
                    only for the specific member you want
                    to share it with.
                  </p>
                </div>

                <button
                  className={
                    primaryButtonClass
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Saving…'
                    : 'Save changes'}
                </button>
              </form>
            )}

            {tab ===
              'Account' && (
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
                  Account & profile status
                </h2>

                <p className="text-[12px] text-[#756a60]">
                  {user.email}
                  {' • '}
                  {user.phone ||
                    'No phone number'}
                </p>

                <p className="text-[12px] text-[#756a60]">
                  Current status:{' '}
                  {profile
                    ?.lifecycleStatus ||
                    'Active'}
                </p>

                <div className="mt-7 flex flex-wrap gap-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      lifecycle(
                        profile
                          ?.lifecycleStatus ===
                          'Paused'
                          ? 'Active'
                          : 'Paused'
                      )
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    {profile
                      ?.lifecycleStatus ===
                    'Paused'
                      ? 'Resume profile'
                      : 'Pause profile'}
                  </button>

                  <button
                    type="button"
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
                    Your profile is hidden immediately
                    and identifying login data is
                    anonymized.
                  </p>

                  <button
                    type="button"
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

            {tab ===
              'Password' && (
              <form
                className={
                  formClass
                }
                onSubmit={
                  password
                }
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
                      key={
                        key
                      }
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

                              [
                                key
                              ]:
                                event.target.checked
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
                    (
                      block
                    ) => (
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
                          type="button"
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