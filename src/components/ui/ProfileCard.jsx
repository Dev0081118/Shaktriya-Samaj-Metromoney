import {
  BadgeCheck,
  Bookmark,
  Check,
  Heart,
  Rocket
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

const displayLocation =
  (
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
  onInterest,
  allowUnshortlist = false
}) {
  const {
    t
  } =
    useTranslation();

  const compatibility = profile.compatibility;
  const mutualAvailable = compatibility?.scoreType === 'mutual' ||
    (compatibility?.candidateHasPreferences &&
      compatibility?.mutualScore !== null && compatibility?.mutualScore !== undefined &&
      compatibility?.reverseFitScore !== null && compatibility?.reverseFitScore !== undefined);
  const score = mutualAvailable
    ? (compatibility?.commonScore ?? compatibility?.mutualScore)
    : compatibility?.score;
  const scoreLabel = mutualAvailable ? 'Common match' : 'Your preference fit';
  const reciprocalEligible = compatibility?.eligible === true;
  const scoreStatus = mutualAvailable
    ? reciprocalEligible ? 'Eligible mutual match' : 'Preference overlap · requirements unmet'
    : 'One-sided score · mutual match unavailable';

  const shortlisted =
    !!profile.shortlisted;

  const interestSent =
    !!profile.interestSent;

  const interestAccepted =
    profile.interestStatus ===
    'Accepted';

  const boosted =
    !!profile.boostActive;

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

  const shortlistDisabled =
    shortlisted &&
    !allowUnshortlist;

  return (
    <article className="group overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] transition duration-300 hover:-translate-y-[3px] hover:border-[#bfa589] hover:shadow-[0_20px_50px_rgba(67,19,24,0.09)]">
      <div className="relative h-[360px] overflow-hidden max-[767px]:h-[430px]">
        {profile.profilePhoto ? (
          <img
            src={
              assetUrl(
                profile.profilePhoto
              )
            }
            alt={`${name}'s profile`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[linear-gradient(145deg,#eee3d7,#ddcbbb)] font-['Cormorant_Garamond'] text-[72px] font-medium text-[#681d25]">
            {name
              .charAt(
                0
              )
              .toUpperCase()}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-[#21181799] via-[#21181733] to-transparent" />

        <div className="absolute left-[14px] top-[14px] flex flex-col items-start gap-2">
          {boosted && (
            <span className="inline-flex items-center gap-[6px] rounded-full border border-white/40 bg-[#681d25e8] px-[11px] py-[7px] text-[8px] font-extrabold uppercase tracking-[0.1em] text-white shadow-sm backdrop-blur">
              <Rocket
                size={
                  13
                }
              />

              Boosted
            </span>
          )}

          {profile.verification
            ?.adminVerified && (
            <span className="inline-flex items-center gap-[6px] rounded-full bg-[#fffdf8ed] px-[10px] py-[7px] text-[9px] font-extrabold text-[#681d25] shadow-sm backdrop-blur">
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
        </div>

        <button
          type="button"
          disabled={
            shortlistDisabled
          }
          className={`absolute right-[14px] top-[14px] grid h-10 w-10 place-items-center rounded-full transition ${
            shortlisted
              ? allowUnshortlist
                ? 'bg-[#681d25] text-white hover:bg-[#431318]'
                : 'cursor-default bg-[#681d25] text-white'
              : 'bg-[#211817b5] text-white hover:bg-[#681d25]'
          }`}
          onClick={() => {
            if (
              !shortlistDisabled
            ) {
              onShortlist?.(
                profile
              );
            }
          }}
          aria-label={
            shortlisted
              ? allowUnshortlist
                ? 'Remove from shortlist'
                : 'Profile shortlisted'
              : t(
                  'actions.shortlist'
                )
          }
          title={
            shortlisted
              ? allowUnshortlist
                ? 'Remove from shortlist'
                : 'Shortlisted'
              : t(
                  'actions.shortlist'
                )
          }
        >
          <Bookmark
            size={
              18
            }
            fill={
              shortlisted
                ? 'currentColor'
                : 'none'
            }
          />
        </button>

        {score !==
          undefined &&
          score !==
            null && (
            <div className="absolute bottom-[14px] right-[14px] min-w-[60px] rounded-full border border-white/40 bg-[#fffdf8ed] px-3 py-2 text-center shadow-sm backdrop-blur">
              <strong className="block text-[14px] font-extrabold leading-none text-[#681d25]">
                {Math.round(
                  score
                )}
                %
              </strong>

              <small className="mt-1 block text-[7px] font-extrabold uppercase tracking-[0.1em] text-[#756a60]">
{scoreLabel}
              </small>
            </div>
          )}
      </div>

      <div className="p-5">
        {compatibility && (
          <div className="mb-3 rounded border border-[#e9dfd4] bg-[#f8f2eb] px-3 py-2 text-[10px] text-[#681d25]">
            Your fit: {compatibility.score == null ? 'Unavailable' : `${Math.round(compatibility.preferenceFitScore ?? compatibility.score)}%`}
            {' · '}Their fit: {mutualAvailable ? `${Math.round(compatibility.reverseFitScore)}%` : 'Not available'}
            <span className={`mt-1 block ${reciprocalEligible ? 'text-[#416c4e]' : 'text-[#876039]'}`}>
              {scoreStatus}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-['Cormorant_Garamond'] text-[31px] font-medium leading-none text-[#2c1a18]">
            {name}
          </h3>

          {boosted && (
            <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#91683f]">
              <Rocket
                size={
                  11
                }
              />

              Featured
            </span>
          )}
        </div>

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
              <span className="text-[#c0afa0]">
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
              <span className="text-[#c0afa0]">
                •
              </span>

              <span>
                {location}
              </span>
            </>
          )}
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
                ? 'Interest Sent'
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