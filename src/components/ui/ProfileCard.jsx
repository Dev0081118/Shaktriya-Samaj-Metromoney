import {
  BadgeCheck,
  Bookmark,
  Check,
  Heart
} from 'lucide-react';

import {
  useTranslation
} from 'react-i18next';

import {
  Link
} from 'react-router-dom';

import {
  assetUrl
} from '../../services/api';

const displayLocation = (
  profile
) => {
  const nativeDistrict =
    profile.location
      ?.nativeDistrict;

  const nativeState =
    profile.location
      ?.nativeState;

  if (
    nativeDistrict &&
    nativeState
  ) {
    return `${nativeDistrict}, ${nativeState}`;
  }

  if (
    nativeDistrict
  ) {
    return nativeDistrict;
  }

  if (
    nativeState
  ) {
    return nativeState;
  }

  return '';
};

export default function ProfileCard({
  profile,
  onShortlist,
  onInterest
}) {
  const {
    t
  } =
    useTranslation();

  const score =
    profile.compatibility
      ?.score;

  const shortlisted =
    !!profile.shortlisted;

  const interestSent =
    !!profile.interestSent;

  const interestAccepted =
    profile.interestStatus ===
    'Accepted';

  const location =
    displayLocation(
      profile
    );

  const name =
    profile.firstName ||
    'Member';

  const profilePath =
    profile.profileId
      ? `/profile/${profile.profileId}`
      : '#';

  return (
    <article className="group overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] transition duration-200 hover:-translate-y-[2px] hover:border-[#c8b29b] hover:shadow-[0_16px_40px_rgba(67,19,24,0.07)]">
      <div className="relative h-[380px] overflow-hidden max-[767px]:h-[430px]">
        {profile.profilePhoto ? (
          <img
            src={
              assetUrl(
                profile.profilePhoto
              )
            }
            alt={`${name}'s profile`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#e8dace] font-['Cormorant_Garamond'] text-[72px] font-medium text-[#681d25]">
            {name
              .charAt(
                0
              )
              .toUpperCase()}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-[#21181766] to-transparent" />

        {profile.verification
          ?.adminVerified && (
          <span className="absolute left-[14px] top-[14px] flex items-center gap-[6px] rounded-full bg-[#fffdf8eb] px-[10px] py-[7px] text-[9px] font-extrabold text-[#681d25] shadow-sm backdrop-blur">
            <BadgeCheck
              size={
                14
              }
            />

            {t(
              'profile.verified'
            )}
          </span>
        )}

        <button
          type="button"
          disabled={
            shortlisted
          }
          className={`absolute right-[14px] top-[14px] grid h-10 w-10 place-items-center rounded-full transition ${
            shortlisted
              ? 'cursor-default bg-[#681d25] text-white'
              : 'bg-[#211817b5] text-white hover:bg-[#681d25]'
          }`}
          onClick={() => {
            if (
              !shortlisted
            ) {
              onShortlist?.(
                profile
              );
            }
          }}
          aria-label={
            shortlisted
              ? 'Profile shortlisted'
              : t(
                  'actions.shortlist'
                )
          }
          title={
            shortlisted
              ? 'Shortlisted'
              : t(
                  'actions.shortlist'
                )
          }
        >
          {shortlisted ? (
            <Bookmark
              size={
                18
              }
              fill="currentColor"
            />
          ) : (
            <Bookmark
              size={
                18
              }
            />
          )}
        </button>

        {score !==
          undefined &&
          score !==
            null && (
            <div className="absolute bottom-[14px] right-[14px] min-w-[58px] rounded-full bg-[#fffdf8ed] px-3 py-2 text-center shadow-sm backdrop-blur">
              <strong className="block text-[14px] font-extrabold leading-none text-[#681d25]">
                {Math.round(
                  score
                )}
                %
              </strong>

              <small className="mt-1 block text-[7px] font-extrabold uppercase tracking-[0.1em] text-[#756a60]">
                {t(
                  'profile.match'
                )}
              </small>
            </div>
          )}
      </div>

      <div className="p-5">
        <div>
          <h3 className="font-['Cormorant_Garamond'] text-[31px] font-medium leading-none text-[#2c1a18]">
            {name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#756a60]">
            {profile.age !==
              undefined &&
              profile.age !==
                null && (
                <span>
                  {profile.age}{' '}
                  {t(
                    'profile.years'
                  )}
                </span>
              )}

            {profile.height && (
              <>
                <span
                  aria-hidden="true"
                  className="text-[#c0afa0]"
                >
                  •
                </span>

                <span>
                  {
                    profile.height
                  }{' '}
                  cm
                </span>
              </>
            )}

            {location && (
              <>
                <span
                  aria-hidden="true"
                  className="text-[#c0afa0]"
                >
                  •
                </span>

                <span>
                  {location}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-y border-[#e9dfd4] py-4">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#a28c78]">
              Education
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#5e4e46]">
              {profile.education
                ?.highestEducation ||
                t(
                  'profile.educationMissing'
                )}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#a28c78]">
              Profession
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#5e4e46]">
              {profile.career
                ?.occupation ||
                t(
                  'profile.professionMissing'
                )}
            </p>
          </div>

          {(profile.community
            ?.clan ||
            profile.community
              ?.vansh) && (
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#a28c78]">
                Lineage
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#5e4e46]">
                {[
                  profile.community
                    ?.clan,

                  profile.community
                    ?.vansh
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    ' · '
                  )}
              </p>
            </div>
          )}
        </div>

        <div className="mt-[18px] flex items-center justify-between gap-4">
          <Link
            to={
              profilePath
            }
            className="inline-flex items-center gap-2 border-b border-[#c49b70] pb-[3px] text-[11px] font-extrabold text-[#681d25]"
          >
            {t(
              'actions.viewProfile'
            )}
          </Link>

          <button
            type="button"
            disabled={
              interestSent
            }
            className={`inline-flex items-center gap-[7px] text-[10px] font-extrabold transition ${
              interestAccepted
                ? 'cursor-default text-[#466344]'
                : interestSent
                  ? 'cursor-default text-[#8a7e73]'
                  : 'text-[#681d25] hover:text-[#431318]'
            }`}
            onClick={() => {
              if (
                !interestSent
              ) {
                onInterest?.(
                  profile
                );
              }
            }}
          >
            {interestAccepted ? (
              <Check
                size={
                  15
                }
              />
            ) : (
              <Heart
                size={
                  15
                }
                fill={
                  interestSent
                    ? 'currentColor'
                    : 'none'
                }
              />
            )}

            {interestAccepted
              ? 'Interest Accepted'
              : interestSent
                ? t(
                    'member.interestSent'
                  )
                : t(
                    'actions.expressInterest'
                  )}
          </button>
        </div>

        {(shortlisted ||
          interestSent) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eee4d8] pt-4">
            {shortlisted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#681d2508] px-3 py-[7px] text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#681d25]">
                <Bookmark
                  size={
                    11
                  }
                  fill="currentColor"
                />

                Shortlisted
              </span>
            )}

            {interestSent && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-[7px] text-[8px] font-extrabold uppercase tracking-[0.08em] ${
                  interestAccepted
                    ? 'bg-[#4663440d] text-[#466344]'
                    : 'bg-[#91683f0d] text-[#7d5c3a]'
                }`}
              >
                {interestAccepted
                  ? 'Interest accepted'
                  : 'Interest pending'}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}