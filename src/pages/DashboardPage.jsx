import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ProfileCard from '../components/ui/ProfileCard';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { translateStatus } from '../utils/translatedLabels';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white";

export default function DashboardPage() {
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  const notify = useToast();

  const {
    t,
    i18n
  } = useTranslation();

  useEffect(() => {
    api('/dashboard')
      .then((response) =>
        setData(response.data)
      )
      .catch((caught) =>
        setError(caught.message)
      );
  }, []);

  const interest = async (profile) => {
    try {
      await api('/interests', {
        method: 'POST',
        body: JSON.stringify({
          receiverProfile:
            profile._id
        })
      });

      setData((current) => ({
        ...current,
        recommendedProfiles:
          current.recommendedProfiles.map(
            (item) =>
              item._id ===
              profile._id
                ? {
                    ...item,
                    interestSent:
                      true
                  }
                : item
          )
      }));

      notify(
        t('member.interestSent')
      );
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  const shortlist = async (
    profile
  ) => {
    try {
      await api('/shortlist', {
        method: 'POST',
        body: JSON.stringify({
          profileId:
            profile._id
        })
      });

      setData((current) => ({
        ...current,
        shortlistCount:
          current.shortlistCount + 1,
        recommendedProfiles:
          current.recommendedProfiles.map(
            (item) =>
              item._id ===
              profile._id
                ? {
                    ...item,
                    shortlisted:
                      true
                  }
                : item
          )
      }));

      notify(
        t(
          'member.shortlistedToast'
        )
      );
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  if (error) {
    return (
      <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
          {t(
            'member.dashboardUnavailable'
          )}
        </h2>

        <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-skeleton">
        {t(
          'member.dashboardLoading'
        )}
      </div>
    );
  }

  if (!data.profile) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
          {t(
            'member.beginProfile'
          )}
        </h2>

        <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {t(
            'member.beginProfileBody'
          )}
        </p>

        <Link
          className={`${primaryButtonClass} mt-6`}
          to="/onboarding"
        >
          {t(
            'member.startOnboarding'
          )}
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="relative -mx-3 mb-[44px] flex min-h-[180px] flex-col justify-end overflow-hidden bg-[linear-gradient(90deg,#eee4d8_0%,#eee4d8e8_58%,transparent),url('/assets/member/member-lounge.webp')] bg-[position:right_center] bg-[length:45%_100%] bg-no-repeat pb-[30px] pl-[34px] pr-[38%] pt-[34px] max-[767px]:mx-0 max-[767px]:min-h-0 max-[767px]:bg-[linear-gradient(90deg,#eee4d8ee,#eee4d8c9),url('/assets/member/member-lounge.webp')] max-[767px]:bg-cover max-[767px]:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          {formatDate(
            new Date(),
            i18n.language,
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            }
          )}
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18] max-[767px]:break-words max-[767px]:text-[42px]">
          {t(
            'member.greeting',
            {
              name:
                data.profile
                  .firstName
            }
          )}{' '}

          <em className="font-normal text-[#681d25]">
            {t(
              'member.greetingEmphasis'
            )}
          </em>
        </h1>

        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          {t(
            'member.recommendationBody'
          )}
        </p>
      </header>

      <section className="grid grid-cols-[auto_1fr_auto] items-center gap-[30px] border border-[#ddd0c1] bg-[#fffdf8] p-8 max-[767px]:grid-cols-1">
        <div
          className="relative flex h-[86px] w-[86px] items-center justify-center gap-px rounded-full font-['Cormorant_Garamond'] text-white"
          style={{
            background: `conic-gradient(#681d25 ${data.profileCompletion}%,#e7ded2 0)`
          }}
        >
          <div className="absolute inset-[7px] rounded-full bg-[#681d25]" />

          <strong className="relative z-[2] text-[28px] font-semibold">
            {data.profileCompletion}
          </strong>

          <small className="relative z-[2] text-[12px]">
            %
          </small>
        </div>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {t(
              'member.profileStrength'
            )}{' '}
            ·{' '}
            {translateStatus(
              t,
              data.profileStatus
            )}
          </p>

          <h2 className="my-[5px] font-['Cormorant_Garamond'] text-[28px] font-medium">
            {data.profileCompletion <
            100
              ? t(
                  'member.profileIncomplete'
                )
              : t(
                  'member.profileReady'
                )}
          </h2>

          <p className="text-[12px] text-[#756a60]">
            {t(
              'member.keepCurrent'
            )}
          </p>
        </div>

        <Link
          className={outlineButtonClass}
          to="/onboarding"
        >
          {t(
            'member.completeProfileAction'
          )}

          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="grid grid-cols-5 border-b border-[#ddd0c1] max-[767px]:grid-cols-2">
        {[
          [
            data.newInterestsCount,
            t(
              'member.newInterests'
            )
          ],
          [
            data.mutualMatchesCount,
            t(
              'member.mutualMatches'
            )
          ],
          [
            data.shortlistCount,
            t(
              'nav.shortlisted'
            )
          ],
          [
            data.unreadNotificationsCount,
            t('member.unread')
          ],
          [
            data.profileViewsLast30Days,
            t(
              'member.profileViews'
            )
          ]
        ].map(
          (
            [value, label],
            index
          ) => (
            <div
              key={label}
              className={`px-[15px] py-7 ${
                index === 4
                  ? 'max-[767px]:col-span-full'
                  : ''
              }`}
            >
              <strong className="block font-['Cormorant_Garamond'] text-[32px] font-medium">
                {value}
              </strong>

              <span className="text-[10px] uppercase tracking-[0.1em] text-[#756a60]">
                {label}
              </span>
            </div>
          )
        )}
      </section>

      <div className="mb-6 mt-[52px] flex items-end justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {t(
              'member.selectedForYou'
            )}
          </p>

          <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
            {t(
              'member.recommended'
            )}
          </h2>
        </div>

        <Link
          to="/discover"
          className="flex items-center gap-2 text-[12px] font-extrabold text-[#681d25]"
        >
          {t('actions.viewAll')}

          <ArrowRight size={16} />
        </Link>
      </div>

      {data.recommendedProfiles
        .length ? (
        <div className="grid grid-cols-3 gap-5 max-[1024px]:grid-cols-2 max-[767px]:grid-cols-1">
          {data.recommendedProfiles.map(
            (profile) => (
              <ProfileCard
                key={
                  profile.profileId
                }
                profile={profile}
                onInterest={
                  interest
                }
                onShortlist={
                  shortlist
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
          <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
            {t(
              'member.noRecommendations'
            )}
          </p>
        </div>
      )}

      <section className="mt-[55px] bg-[#eee4d8] p-8">
        <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
          {t(
            'member.nextSteps'
          )}
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-5 max-[767px]:grid-cols-1">
          <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <Camera className="row-span-2 text-[#681d25]" />

            <b className="text-[12px]">
              {t(
                'member.addPhoto'
              )}
            </b>

            <small className="text-[11px] text-[#756a60]">
              Profiles with photos
              receive more considered
              responses.
            </small>
          </span>

          <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <CheckCircle2 className="row-span-2 text-[#681d25]" />

            <b className="text-[12px]">
              {t(
                'member.reviewPreferences'
              )}
            </b>

            <small className="text-[11px] text-[#756a60]">
              Keep recommendations
              precise and relevant.
            </small>
          </span>

          <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <Eye className="row-span-2 text-[#681d25]" />

            <b className="text-[12px]">
              {t(
                'member.reviewPrivacy'
              )}
            </b>

            <small className="text-[11px] text-[#756a60]">
              Choose what other members
              can see.
            </small>
          </span>
        </div>
      </section>
    </>
  );
}