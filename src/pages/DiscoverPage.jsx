/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import {
  LockKeyhole,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import {
  Link,
  useSearchParams
} from 'react-router-dom';

import ProfileCard from '../components/ui/ProfileCard';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const initial = {
  search: '',
  city: '',
  state: '',
  lookingFor: '',
  ageMin: '',
  ageMax: '',
  heightMin: '',
  heightMax: '',
  education: '',
  occupation: '',
  maritalStatus: '',
  community: '',
  diet: '',
  verified: false,
  withPhoto: false
};

const advancedKeys = [
  'heightMin',
  'heightMax',
  'education',
  'occupation',
  'community',
  'diet',
  'verified',
  'withPhoto'
];

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const inputClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none";

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:opacity-55";

const textLinkClass =
  "border-b border-[#c49b70] pb-[3px] text-[12px] font-extrabold text-[#681d25]";

export default function DiscoverPage() {
  const [params] =
    useSearchParams();

  const fromUrl = {
    ...initial,
    ...Object.fromEntries(
      params.entries()
    )
  };

  const [filters, setFilters] =
    useState(fromUrl);

  const [show, setShow] =
    useState(false);

  const [items, setItems] =
    useState([]);

  const [
    pagination,
    setPagination
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [advanced, setAdvanced] =
    useState(false);

  const notify = useToast();

  const load = async (
    current = filters,
    page = 1
  ) => {
    setLoading(true);
    setError('');

    try {
      const allowed = advanced
        ? current
        : Object.fromEntries(
            Object.entries(
              current
            ).filter(
              ([key]) =>
                !advancedKeys.includes(
                  key
                )
            )
          );

      const query =
        new URLSearchParams({
          ...Object.fromEntries(
            Object.entries(
              allowed
            ).filter(
              ([, value]) =>
                value !== '' &&
                value !== false
            )
          ),
          page: String(page),
          limit: '12'
        }).toString();

      const result = (
        await api(
          `/profiles/discover?${query}`
        )
      ).data;

      setItems(
        page === 1
          ? result.profiles
          : (existing) => [
              ...existing,
              ...result.profiles
            ]
      );

      setPagination(
        result.pagination
      );
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api('/entitlements')
      .then((result) =>
        setAdvanced(
          Boolean(
            result.data
              .entitlements
              .advancedSearch
          )
        )
      )
      .finally(() =>
        load(fromUrl)
      );
  }, []);

  const update = (
    key,
    value
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const shortlist = async (
    profile
  ) => {
    try {
      if (profile.shortlisted) {
        await api(
          `/shortlist/${profile._id}`,
          {
            method: 'DELETE'
          }
        );
      } else {
        await api('/shortlist', {
          method: 'POST',
          body: JSON.stringify({
            profileId:
              profile._id
          })
        });
      }

      setItems((existing) =>
        existing.map((item) =>
          item._id === profile._id
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
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  const interest = async (
    profile
  ) => {
    try {
      await api('/interests', {
        method: 'POST',
        body: JSON.stringify({
          receiverProfile:
            profile._id
        })
      });

      setItems((existing) =>
        existing.map((item) =>
          item._id === profile._id
            ? {
                ...item,
                interestSent: true
              }
            : item
        )
      );

      notify('Interest sent.');
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  return (
    <>
      <header className="relative -mx-3 mb-[34px] flex min-h-[190px] flex-col justify-end overflow-hidden bg-[linear-gradient(90deg,#f5f0e8_0%,#f5f0e8d9_52%,transparent),url('/assets/member/discover-header.webp')] bg-[position:right_center] bg-cover px-[42px] py-[34px] max-[767px]:mx-0 max-[767px]:min-h-[170px] max-[767px]:p-[25px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Preference-based discovery
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          Discover with{' '}
          <em className="font-normal text-[#681d25]">
            intention.
          </em>
        </h1>

        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          Compatibility reflects
          shared preferences—not a
          prediction of relationship
          success.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
        className="mb-[25px] flex gap-3"
      >
        <label className="flex flex-1 items-center gap-[10px] border border-[#ddd0c1] bg-[#fffdf8] px-4">
          <Search size={18} />

          <input
            className="flex-1 border-0 bg-transparent p-[14px] outline-none"
            value={filters.search}
            onChange={(event) =>
              update(
                'search',
                event.target.value
              )
            }
            placeholder="Search by name, city or profession"
          />
        </label>

        <button
          type="button"
          className="flex items-center gap-[9px] border border-[#ddd0c1] bg-[#fffdf8] px-5 text-[12px] font-extrabold max-[767px]:px-[13px] max-[767px]:text-0"
          onClick={() =>
            setShow(!show)
          }
        >
          <SlidersHorizontal
            size={17}
          />

          <span className="max-[767px]:hidden">
            Filters
          </span>
        </button>
      </form>

      <div className="grid grid-cols-[220px_1fr] gap-8 max-[767px]:grid-cols-1">
        <aside
          className={`${show ? 'grid' : 'hidden'} content-start gap-[15px] bg-[#eee4d8] p-6 md:grid`}
        >
          <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium">
            Refine results
          </h3>

          <label className={labelClass}>
            Looking for

            <select
              className={inputClass}
              value={
                filters.lookingFor
              }
              onChange={(event) =>
                update(
                  'lookingFor',
                  event.target.value
                )
              }
            >
              <option value="">
                My preference
              </option>

              <option>
                Female
              </option>

              <option>
                Male
              </option>
            </select>
          </label>

          {[
            ['city', 'City'],
            ['state', 'State'],
            [
              'maritalStatus',
              'Marital status'
            ]
          ].map(([key, label]) => (
            <label
              className={labelClass}
              key={key}
            >
              {label}

              <input
                className={inputClass}
                value={filters[key]}
                onChange={(event) =>
                  update(
                    key,
                    event.target.value
                  )
                }
              />
            </label>
          ))}

          <div className="grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
            <label className={labelClass}>
              Min age

              <input
                className={inputClass}
                type="number"
                value={filters.ageMin}
                onChange={(event) =>
                  update(
                    'ageMin',
                    event.target.value
                  )
                }
              />
            </label>

            <label className={labelClass}>
              Max age

              <input
                className={inputClass}
                type="number"
                value={filters.ageMax}
                onChange={(event) =>
                  update(
                    'ageMax',
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <fieldset
            disabled={!advanced}
            className="grid gap-[15px] disabled:opacity-60"
          >
            <legend className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]">
              {!advanced && (
                <LockKeyhole
                  size={14}
                />
              )}

              Advanced filters
            </legend>

            {[
              [
                'education',
                'Education'
              ],
              [
                'occupation',
                'Occupation'
              ],
              [
                'community',
                'Community'
              ],
              ['diet', 'Diet']
            ].map(
              ([key, label]) => (
                <label
                  className={labelClass}
                  key={key}
                >
                  {label}

                  <input
                    className={inputClass}
                    value={
                      filters[key]
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        key,
                        event.target
                          .value
                      )
                    }
                  />
                </label>
              )
            )}

            <label className="flex items-center gap-2 text-[11px] text-[#5e4e46]">
              <input
                type="checkbox"
                checked={
                  filters.verified
                }
                onChange={(event) =>
                  update(
                    'verified',
                    event.target.checked
                  )
                }
              />

              Verified only
            </label>

            <label className="flex items-center gap-2 text-[11px] text-[#5e4e46]">
              <input
                type="checkbox"
                checked={
                  filters.withPhoto
                }
                onChange={(event) =>
                  update(
                    'withPhoto',
                    event.target.checked
                  )
                }
              />

              With photograph
            </label>
          </fieldset>

          {!advanced && (
            <p className="text-[11px] leading-[1.6] text-[#756a60]">
              <Link
                to="/membership"
                className="font-extrabold text-[#681d25]"
              >
                Upgrade membership
              </Link>{' '}
              to use advanced filters.
            </p>
          )}

          <button className={primaryButtonClass}>
            Apply filters
          </button>

          <button
            type="button"
            className={textLinkClass}
            onClick={() => {
              setFilters(initial);
              load(initial);
            }}
          >
            Reset filters
          </button>
        </aside>

        <section>
          <p className="mb-[15px] text-[10px] uppercase tracking-[0.14em] text-[#756a60]">
            {pagination?.total ??
              items.length}{' '}
            thoughtful introductions
          </p>

          {loading &&
          !items.length ? (
            <div className="page-skeleton">
              Finding suitable
              profiles…
            </div>
          ) : error ? (
            <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
              <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
                Discovery unavailable
              </h2>

              <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
                {error}
              </p>
            </div>
          ) : items.length ? (
            <>
              <div className="grid grid-cols-2 gap-5 max-[767px]:grid-cols-1">
                {items.map(
                  (profile) => (
                    <ProfileCard
                      key={
                        profile.profileId
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
                    />
                  )
                )}
              </div>

              {pagination?.page <
                pagination?.totalPages && (
                <button
                  className={`${outlineButtonClass} mx-auto mt-[30px] flex`}
                  disabled={loading}
                  onClick={() =>
                    load(
                      filters,
                      pagination.page +
                        1
                    )
                  }
                >
                  {loading
                    ? 'Loading…'
                    : 'Load more profiles'}
                </button>
              )}
            </>
          ) : (
            <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
              <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
                No profiles found
              </h2>

              <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
                Try widening the
                filters to see more
                suitable
                introductions.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}