import {
  ChevronDown,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  Link,
  useSearchParams
} from 'react-router-dom';

import ProfileCard from '../components/ui/ProfileCard';

import {
  useToast
} from '../context/ToastContext';

import {
  DIET_OPTIONS,
  INDIA_STATES,
  MARITAL_STATUS_OPTIONS,
  RAJPUT_SURNAMES,
  VANSH_OPTIONS
} from '../data/profileOptions';

import {
  api
} from '../services/api';

const initialFilters = {
  search:
    '',

  lookingFor:
    '',

  district:
    '',

  state:
    '',

  maritalStatus:
    '',

  ageMin:
    '',

  ageMax:
    '',

  heightMin:
    '',

  heightMax:
    '',

  education:
    '',

  occupation:
    '',

  clan:
    '',

  gotra:
    '',

  vansh:
    '',

  diet:
    '',

  verified:
    false,

  withPhoto:
    false
};

const advancedKeys = [
  'heightMin',
  'heightMax',
  'education',
  'occupation',
  'clan',
  'gotra',
  'vansh',
  'diet',
  'verified',
  'withPhoto'
];

const booleanKeys =
  new Set([
    'verified',
    'withPhoto'
  ]);

const labelClass =
  'grid gap-2 text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#67594f]';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[14px] py-[13px] text-[13px] font-medium tracking-normal text-[#241b18] normal-case outline-none transition focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d250a]';

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-transparent bg-[#681d25] px-5 text-[11px] font-extrabold text-white transition hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-60';

const outlineButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#cbb8a4] bg-[#fffdf8] px-5 text-[11px] font-extrabold text-[#431318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60';

const parseParams =
  (
    params
  ) => {
    const parsed = {
      ...initialFilters
    };

    for (
      const [
        key,
        value
      ] of params.entries()
    ) {
      if (
        !(key in parsed)
      ) {
        continue;
      }

      parsed[key] =
        booleanKeys.has(
          key
        )
          ? value ===
            'true'
          : value;
    }

    return parsed;
  };

const buildQuery =
  (
    filters,
    canUseAdvanced,
    page = 1
  ) => {
    const query =
      new URLSearchParams();

    for (
      const [
        key,
        value
      ] of Object.entries(
        filters
      )
    ) {
      if (
        advancedKeys.includes(
          key
        ) &&
        !canUseAdvanced
      ) {
        continue;
      }

      if (
        value ===
          '' ||
        value ===
          false ||
        value ===
          null ||
        value ===
          undefined
      ) {
        continue;
      }

      query.set(
        key,
        String(
          value
        )
      );
    }

    query.set(
      'page',
      String(
        page
      )
    );

    query.set(
      'limit',
      '12'
    );

    return query;
  };

const activeFilterEntries =
  (
    filters,
    advanced
  ) =>
    Object.entries(
      filters
    ).filter(
      ([
        key,
        value
      ]) => {
        if (
          key ===
          'search'
        ) {
          return false;
        }

        if (
          advancedKeys.includes(
            key
          ) &&
          !advanced
        ) {
          return false;
        }

        return (
          value !==
            '' &&
          value !==
            false &&
          value !==
            null &&
          value !==
            undefined
        );
      }
    );

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Any'
}) {
  return (
    <label className={labelClass}>
      {label}

      <div className="relative">
        <select
          className={`${fieldClass} appearance-none pr-10`}
          value={
            value ||
            ''
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        >
          <option value="">
            {placeholder}
          </option>

          {options.map(
            (
              option
            ) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={
            14
          }
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756a60]"
        />
      </div>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  min,
  max
}) {
  return (
    <label className={labelClass}>
      {label}

      <input
        className={fieldClass}
        type={type}
        value={
          value ??
          ''
        }
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

export default function DiscoverPage() {
  const [
    searchParams,
    setSearchParams
  ] =
    useSearchParams();

  const [
  initialFromUrl
] =
  useState(
    () =>
      parseParams(
        searchParams
      )
  );

  const [
    filters,
    setFilters
  ] =
    useState(
      initialFromUrl
    );

  const [
    appliedFilters,
    setAppliedFilters
  ] =
    useState(
      initialFromUrl
    );

  const [
    filtersOpen,
    setFiltersOpen
  ] =
    useState(
      false
    );

  const [
    items,
    setItems
  ] =
    useState([]);

  const [
    pagination,
    setPagination
  ] =
    useState(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    loadingMore,
    setLoadingMore
  ] =
    useState(
      false
    );

  const [
    error,
    setError
  ] =
    useState(
      ''
    );

  const [
    advanced,
    setAdvanced
  ] =
    useState(
      false
    );

  const [
    entitlementLoaded,
    setEntitlementLoaded
  ] =
    useState(
      false
    );

  const notify =
    useToast();

  const activeFilters =
    useMemo(
      () =>
        activeFilterEntries(
          appliedFilters,
          advanced
        ),
      [
        appliedFilters,
        advanced
      ]
    );

  const syncUrl =
    (
      current,
      canUseAdvanced
    ) => {
      const query =
        buildQuery(
          current,
          canUseAdvanced,
          1
        );

      query.delete(
        'page'
      );

      query.delete(
        'limit'
      );

      setSearchParams(
        query,
        {
          replace:
            true
        }
      );
    };

  const load =
  useCallback(
    async (
      current,
      page = 1,
      canUseAdvanced = false
    ) => {
      if (
        page ===
        1
      ) {
        setLoading(
          true
        );
      } else {
        setLoadingMore(
          true
        );
      }

      setError('');

      try {
        const query =
          buildQuery(
            current,
            canUseAdvanced,
            page
          );

        const result =
          (
            await api(
              `/profiles/discover?${query.toString()}`
            )
          ).data;

        if (
          page ===
          1
        ) {
          setItems(
            result.profiles ||
            []
          );
        } else {
          setItems(
            (
              existing
            ) => [
              ...existing,
              ...(
                result.profiles ||
                []
              )
            ]
          );
        }

        setPagination(
          result.pagination ||
          null
        );
      } catch (
        caught
      ) {
        setError(
          caught.message
        );

        if (
          page ===
          1
        ) {
          setItems([]);
        }
      } finally {
        setLoading(
          false
        );

        setLoadingMore(
          false
        );
      }
        },
    []
  );

  useEffect(
  () => {
    let active =
      true;

    const boot =
      async () => {
        let canUseAdvanced =
          false;

        try {
          const result =
            await api(
              '/entitlements'
            );

          canUseAdvanced =
            Boolean(
              result.data
                ?.entitlements
                ?.advancedSearch
            );
        } catch {
          /*
           * Entitlement lookup failure falls back to
           * basic discovery without advanced filters.
           */
        }

        if (
          !active
        ) {
          return;
        }

        setAdvanced(
          canUseAdvanced
        );

        setEntitlementLoaded(
          true
        );

        await load(
          initialFromUrl,
          1,
          canUseAdvanced
        );
      };

    boot();

    return () => {
      active =
        false;
    };
  },
  [
    initialFromUrl,
    load
  ]
);

  const update =
    (
      key,
      value
    ) =>
      setFilters(
        (
          current
        ) => ({
          ...current,

          [key]:
            value
        })
      );

  const applyFilters =
    async (
      event
    ) => {
      event?.preventDefault();

      const next = {
        ...filters
      };

      setAppliedFilters(
        next
      );

      syncUrl(
        next,
        advanced
      );

      await load(
        next,
        1,
        advanced
      );

      setFiltersOpen(
        false
      );
    };

  const resetFilters =
    async () => {
      const next = {
        ...initialFilters
      };

      setFilters(
        next
      );

      setAppliedFilters(
        next
      );

      setSearchParams(
        {},
        {
          replace:
            true
        }
      );

      await load(
        next,
        1,
        advanced
      );
    };

  const removeFilter =
    async (
      key
    ) => {
      const next = {
        ...appliedFilters,

        [key]:
          booleanKeys.has(
            key
          )
            ? false
            : ''
      };

      setFilters(
        next
      );

      setAppliedFilters(
        next
      );

      syncUrl(
        next,
        advanced
      );

      await load(
        next,
        1,
        advanced
      );
    };

  const shortlist =
    async (
      profile
    ) => {
      try {
        if (
          profile.shortlisted
        ) {
          await api(
            `/shortlist/${profile._id}`,
            {
              method:
                'DELETE'
            }
          );
        } else {
          await api(
            '/shortlist',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  profileId:
                    profile._id
                })
            }
          );
        }

        setItems(
          (
            existing
          ) =>
            existing.map(
              (
                item
              ) =>
                item._id ===
                profile._id
                  ? {
                      ...item,

                      shortlisted:
                        !item.shortlisted
                    }
                  : item
            )
        );

        notify(
          profile.shortlisted
            ? 'Removed from shortlist.'
            : 'Profile shortlisted.'
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

  const interest =
    async (
      profile
    ) => {
      if (
        profile.interestSent
      ) {
        return;
      }

      try {
        await api(
          '/interests',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                receiverProfile:
                  profile._id
              })
          }
        );

        setItems(
          (
            existing
          ) =>
            existing.map(
              (
                item
              ) =>
                item._id ===
                profile._id
                  ? {
                      ...item,

                      interestSent:
                        true,

                      interestStatus:
                        'Pending'
                    }
                  : item
            )
        );

        notify(
          'Interest sent.'
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

  const total =
    pagination?.total ??
    items.length;

  return (
    <>
      <header className="relative -mx-3 -mt-3 mb-8 overflow-hidden border-b border-[#d8c8b7] bg-subtle-texture max-[767px]:mx-0">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[46%] bg-[url('/assets/member/discover-header.webp')] bg-cover bg-center max-[767px]:w-full max-[767px]:hidden rounded-l-3xl border-l border-[#ddd0c1]"
        />

        <div className="relative max-w-[780px] px-[clamp(24px,5vw,48px)] py-[clamp(40px,6vw,68px)]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#91683f]">
            Rajput community discovery
          </p>

          <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(44px,6vw,72px)] font-medium leading-[0.94] text-[#2c1a18]">
            Discover with{' '}

            <em className="font-normal text-[#681d25]">
              intention.
            </em>
          </h1>

          <p className="mt-5 max-w-[620px] text-[13px] leading-[1.9] text-[#756a60]">
            Browse verified community profiles and
            refine results using the details that matter
            to you. Exact residential addresses and
            private contact information are never used
            here.
          </p>
        </div>
      </header>

      <section className="mb-6 border border-[#ddd0c1] bg-[#fffdf8]">
        <form
          onSubmit={
            applyFilters
          }
        >
          <div className="flex items-stretch gap-3 p-4 max-[700px]:flex-col">
            <label className="flex min-h-[48px] flex-1 items-center gap-3 border border-[#ddd0c1] bg-white px-4">
              <Search
                size={
                  17
                }
                className="shrink-0 text-[#681d25]"
              />

              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[13px] text-[#241b18] outline-none"
                value={
                  filters.search
                }
                onChange={(
                  event
                ) =>
                  update(
                    'search',
                    event.target.value
                  )
                }
                placeholder="Search name, Shakh, Gotra, native place, education or profession"
              />

              {filters.search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#756a60] hover:bg-[#f4eee7]"
                  onClick={() =>
                    update(
                      'search',
                      ''
                    )
                  }
                >
                  <X
                    size={
                      14
                    }
                  />
                </button>
              )}
            </label>

            <button
              type="submit"
              className={
                primaryButtonClass
              }
            >
              <Search
                size={
                  15
                }
              />

              Search
            </button>

            <button
              type="button"
              className={
                outlineButtonClass
              }
              onClick={() =>
                setFiltersOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >
              <SlidersHorizontal
                size={
                  15
                }
              />

              Filters

              {activeFilters.length >
                0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#681d25] px-1 text-[9px] text-white">
                  {
                    activeFilters.length
                  }
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="border-t border-[#e6dbce] bg-[#f8f3ec] p-5">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
                    Refine discovery
                  </p>

                  <h2 className="mt-1 font-['Cormorant_Garamond'] text-[28px] font-medium text-[#2c1a18]">
                    Find profiles that fit your preferences
                  </h2>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#681d25]"
                  onClick={
                    resetFilters
                  }
                >
                  <RotateCcw
                    size={
                      13
                    }
                  />

                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1">
                <SelectField
                  label="Looking for"
                  value={
                    filters.lookingFor
                  }
                  placeholder="My preference"
                  options={[
                    'Female',
                    'Male'
                  ]}
                  onChange={(
                    value
                  ) =>
                    update(
                      'lookingFor',
                      value
                    )
                  }
                />

                <SelectField
                  label="Native State"
                  value={
                    filters.state
                  }
                  options={
                    INDIA_STATES
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'state',
                      value
                    )
                  }
                />

                <InputField
                  label="Native District"
                  value={
                    filters.district
                  }
                  placeholder="e.g. Rajkot"
                  onChange={(
                    value
                  ) =>
                    update(
                      'district',
                      value
                    )
                  }
                />

                <SelectField
                  label="Marital Status"
                  value={
                    filters.maritalStatus
                  }
                  options={
                    MARITAL_STATUS_OPTIONS
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maritalStatus',
                      value
                    )
                  }
                />

                <InputField
                  label="Minimum Age"
                  type="number"
                  min="18"
                  max="80"
                  value={
                    filters.ageMin
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'ageMin',
                      value
                    )
                  }
                />

                <InputField
                  label="Maximum Age"
                  type="number"
                  min="18"
                  max="80"
                  value={
                    filters.ageMax
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'ageMax',
                      value
                    )
                  }
                />
              </div>

              <div className="my-6 border-t border-[#ddd0c1]" />

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!advanced && (
                    <LockKeyhole
                      size={
                        14
                      }
                      className="text-[#681d25]"
                    />
                  )}

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#5e4e46]">
                    Advanced filters
                  </p>
                </div>

                {!advanced &&
                  entitlementLoaded && (
                  <Link
                    to="/membership"
                    className="text-[10px] font-extrabold text-[#681d25]"
                  >
                    Upgrade to unlock
                  </Link>
                )}
              </div>

              <fieldset
                disabled={
                  !advanced
                }
                className="grid grid-cols-4 gap-4 disabled:opacity-45 max-[1100px]:grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1"
              >
                <InputField
                  label="Minimum Height (cm)"
                  type="number"
                  min="100"
                  max="250"
                  value={
                    filters.heightMin
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'heightMin',
                      value
                    )
                  }
                />

                <InputField
                  label="Maximum Height (cm)"
                  type="number"
                  min="100"
                  max="250"
                  value={
                    filters.heightMax
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'heightMax',
                      value
                    )
                  }
                />

                <InputField
                  label="Education"
                  value={
                    filters.education
                  }
                  placeholder="e.g. MBA"
                  onChange={(
                    value
                  ) =>
                    update(
                      'education',
                      value
                    )
                  }
                />

                <InputField
                  label="Profession"
                  value={
                    filters.occupation
                  }
                  placeholder="e.g. Engineer"
                  onChange={(
                    value
                  ) =>
                    update(
                      'occupation',
                      value
                    )
                  }
                />

                <SelectField
                  label="Surname / Shakh"
                  value={
                    filters.clan
                  }
                  options={
                    RAJPUT_SURNAMES.filter(
                      (
                        item
                      ) =>
                        item !==
                        'Other'
                    )
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'clan',
                      value
                    )
                  }
                />

                <InputField
                  label="Gotra"
                  value={
                    filters.gotra
                  }
                  placeholder="Enter Gotra"
                  onChange={(
                    value
                  ) =>
                    update(
                      'gotra',
                      value
                    )
                  }
                />

                <SelectField
                  label="Kul / Vansh"
                  value={
                    filters.vansh
                  }
                  options={
                    VANSH_OPTIONS.filter(
                      (
                        item
                      ) =>
                        item !==
                        'Other'
                    )
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'vansh',
                      value
                    )
                  }
                />

                <SelectField
                  label="Diet"
                  value={
                    filters.diet
                  }
                  options={
                    DIET_OPTIONS
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'diet',
                      value
                    )
                  }
                />
              </fieldset>

              <fieldset
                disabled={
                  !advanced
                }
                className="mt-5 flex flex-wrap gap-3 disabled:opacity-45"
              >
                <label className="flex cursor-pointer items-center gap-3 border border-[#ddd0c1] bg-[#fffdf8] px-4 py-3 text-[10px] font-bold text-[#5e4e46]">
                  <input
                    type="checkbox"
                    checked={
                      !!filters.verified
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'verified',
                        event.target.checked
                      )
                    }
                  />

                  Verified profiles only
                </label>

                <label className="flex cursor-pointer items-center gap-3 border border-[#ddd0c1] bg-[#fffdf8] px-4 py-3 text-[10px] font-bold text-[#5e4e46]">
                  <input
                    type="checkbox"
                    checked={
                      !!filters.withPhoto
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'withPhoto',
                        event.target.checked
                      )
                    }
                  />

                  Profiles with photo
                </label>
              </fieldset>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  onClick={() =>
                    setFiltersOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    primaryButtonClass
                  }
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </form>
      </section>

      {activeFilters.length >
        0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8a7e73]">
            Active filters
          </span>

          {activeFilters.map(
            ([
              key,
              value
            ]) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  removeFilter(
                    key
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-[#d7c5b2] bg-[#fffdf8] px-3 py-2 text-[9px] font-bold text-[#5e4e46]"
              >
                {key ===
                'lookingFor'
                  ? 'Looking for'
                  : key ===
                      'maritalStatus'
                    ? 'Marital'
                    : key ===
                        'ageMin'
                      ? 'Min age'
                      : key ===
                          'ageMax'
                        ? 'Max age'
                        : key ===
                            'heightMin'
                          ? 'Min height'
                          : key ===
                              'heightMax'
                            ? 'Max height'
                            : key ===
                                'clan'
                              ? 'Shakh'
                              : key ===
                                  'withPhoto'
                                ? 'With photo'
                                : key ===
                                    'verified'
                                  ? 'Verified'
                                  : key}

                {typeof value ===
                'boolean'
                  ? ''
                  : `: ${value}`}

                <X
                  size={
                    11
                  }
                />
              </button>
            )
          )}

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="ml-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#681d25]"
          >
            Clear all
          </button>
        </div>
      )}

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
              <MapPin
                size={
                  12
                }
              />

              Community profiles
            </p>

            <h2 className="mt-1 font-['Cormorant_Garamond'] text-[34px] font-medium text-[#2c1a18]">
              {loading
                ? 'Finding profiles…'
                : `${total} ${
                    total ===
                    1
                      ? 'profile'
                      : 'profiles'
                  } found`}
            </h2>
          </div>

          <p className="max-w-[420px] text-right text-[10px] leading-5 text-[#8a7e73] max-[700px]:text-left">
            Results are for discovery and browsing.
            Intelligent recommendation ranking will be
            handled separately by the matching system.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
            {Array.from({
              length:
                6
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={index}
                  className="overflow-hidden border border-[#ddd0c1] bg-[#fffdf8]"
                >
                  <div className="h-[330px] animate-pulse bg-[#ece2d7]" />

                  <div className="grid gap-3 p-5">
                    <div className="h-7 w-2/3 animate-pulse bg-[#ece2d7]" />

                    <div className="h-3 w-1/2 animate-pulse bg-[#ece2d7]" />

                    <div className="mt-3 h-16 animate-pulse bg-[#f1e9e0]" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : error ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-6 py-16 text-center">
            <h2 className="font-['Cormorant_Garamond'] text-[35px] font-medium text-[#2c1a18]">
              Discovery unavailable
            </h2>

            <p className="mx-auto mt-3 max-w-[470px] text-[12px] leading-6 text-[#756a60]">
              {error}
            </p>

            <button
              type="button"
              className={`${outlineButtonClass} mt-6`}
              onClick={() =>
                load(
                  appliedFilters,
                  1,
                  advanced
                )
              }
            >
              Try again
            </button>
          </div>
        ) : items.length ? (
          <>
            <div className="grid grid-cols-3 gap-5 max-[1150px]:grid-cols-2 max-[700px]:grid-cols-1">
              {items.map(
                (
                  profile
                ) => (
                  <ProfileCard
                    key={
                      profile.profileId ||
                      profile._id
                    }
                    profile={
                      profile
                    }
                    onShortlist={
                      shortlist
                    }
                    onInterest={
                      interest
                    }
                    allowUnshortlist
                  />
                )
              )}
            </div>

            {pagination?.page <
              pagination?.totalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  disabled={
                    loadingMore
                  }
                  onClick={() =>
                    load(
                      appliedFilters,
                      pagination.page +
                        1,
                      advanced
                    )
                  }
                >
                  {loadingMore
                    ? 'Loading profiles…'
                    : 'Load more profiles'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-6 py-16 text-center">
            <Sparkles
              size={
                25
              }
              className="mx-auto text-[#91683f]"
            />

            <h2 className="mt-4 font-['Cormorant_Garamond'] text-[36px] font-medium text-[#2c1a18]">
              No profiles match these filters
            </h2>

            <p className="mx-auto mt-3 max-w-[480px] text-[12px] leading-6 text-[#756a60]">
              Try widening the age range, removing a
              location filter, or clearing some of the
              selected preferences.
            </p>

            <button
              type="button"
              className={`${outlineButtonClass} mt-6`}
              onClick={
                resetFilters
              }
            >
              <RotateCcw
                size={
                  14
                }
              />

              Clear filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}