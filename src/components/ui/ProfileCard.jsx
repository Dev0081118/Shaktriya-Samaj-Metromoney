import {
  BadgeCheck,
  Bookmark,
  Heart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { assetUrl } from '../../services/api';

export default function ProfileCard({
  profile,
  onShortlist,
  onInterest
}) {
  const score =
    profile.compatibility?.score;

  const { t } =
    useTranslation();

  return (
    <article className="group border border-[#ddd0c1] bg-[#fffdf8]">
      <div className="relative h-[380px] overflow-hidden max-[767px]:h-[430px]">
        {profile.profilePhoto ? (
          <img
            src={assetUrl(
              profile.profilePhoto
            )}
            alt={`${profile.firstName}'s profile`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#e8dace] font-['Cormorant_Garamond'] text-[72px] font-medium text-[#681d25]">
            {
              profile
                .firstName?.[0]
            }
          </div>
        )}

        {profile.verification
          ?.adminVerified && (
          <span className="absolute left-[14px] top-[14px] flex items-center gap-[6px] rounded-full bg-[#fffdf8e8] px-[10px] py-[7px] text-[9px] font-extrabold text-[#681d25]">
            <BadgeCheck
              size={14}
            />

            {t(
              'profile.verified'
            )}
          </span>
        )}

        <button
          type="button"
          className={`absolute right-[14px] top-[14px] grid h-9 w-9 place-items-center rounded-full text-white ${
            profile.shortlisted
              ? 'bg-[#681d25]'
              : 'bg-[#211817b5]'
          }`}
          onClick={() =>
            onShortlist?.(
              profile
            )
          }
          aria-label={t(
            'actions.shortlist'
          )}
        >
          <Bookmark
            size={18}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between gap-[10px]">
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
              {profile.firstName}
            </h3>

            <p className="mt-[3px] text-[11px] text-[#756a60]">
              {profile.age ?? '—'}{' '}
              {t(
                'profile.years'
              )}{' '}
              •{' '}
              {profile.height ||
                '—'}{' '}
              cm •{' '}
              {profile.location
                ?.city ||
                'India'}
            </p>
          </div>

          {score !== undefined && (
            <span className="text-center text-[15px] font-extrabold text-[#681d25]">
              {score}%

              <small className="block text-[7px] uppercase tracking-[0.08em]">
                {t(
                  'profile.match'
                )}
              </small>
            </span>
          )}
        </div>

        <p className="mt-[3px] border-b border-[#e9dfd4] py-[15px] text-[11px] text-[#756a60]">
          {profile.education
            ?.highestEducation ||
            t(
              'profile.educationMissing'
            )}{' '}
          •{' '}
          {profile.career
            ?.occupation ||
            t(
              'profile.professionMissing'
            )}
        </p>

        <div className="mt-[18px] flex items-center justify-between gap-3">
          <Link
            to={`/profile/${profile.profileId}`}
            className="border-b border-[#c49b70] pb-[3px] text-[12px] font-extrabold text-[#681d25]"
          >
            {t(
              'actions.viewProfile'
            )}
          </Link>

          <button
            type="button"
            className="flex items-center gap-[7px] text-[10px] font-extrabold text-[#681d25] disabled:opacity-55"
            disabled={
              profile.interestSent
            }
            onClick={() =>
              onInterest?.(
                profile
              )
            }
          >
            <Heart
              size={15}
            />

            {profile.interestSent
              ? t(
                  'member.interestSent'
                )
              : t(
                  'actions.expressInterest'
                )}
          </button>
        </div>
      </div>
    </article>
  );
}