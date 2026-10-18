import {
  ArrowRight,
  Bell,
  Bookmark,
  CheckCircle2,
  Crown,
  Eye,
  HeartHandshake,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useTranslation
} from 'react-i18next';

import {
  Link
} from 'react-router-dom';

import ProfileCard from '../components/ui/ProfileCard';

import {
  useToast
} from '../context/ToastContext';

import {
  api
} from '../services/api';

import {
  formatDate
} from '../utils/formatters';

import {
  translateStatus
} from '../utils/translatedLabels';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white";

const statCardClass =
  'group relative block h-full min-w-0 overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] p-5 transition duration-200 hover:-translate-y-[2px] hover:border-[#c8b29b] hover:shadow-[0_12px_30px_rgba(67,19,24,0.06)]';

const actionCardClass =
  'group flex min-h-[150px] flex-col justify-between border border-[#ddd0c1] bg-[#fffdf8] p-5 transition duration-200 hover:-translate-y-[2px] hover:border-[#c8b29b] hover:shadow-[0_12px_30px_rgba(67,19,24,0.06)]';

const formatRemaining =
  (
    value
  ) => {
    if (
      value ===
      null
    ) {
      return 'Unlimited';
    }

    return String(
      value ??
        0
    );
  };

function StatCard({
  to,
  icon: Icon,
  value,
  label,
  helper
}) {
  return (
    <Link
      to={to}
      className={
        statCardClass
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <strong className="block font-['Cormorant_Garamond'] text-[38px] font-medium leading-none text-[#2c1a18]">
            {value}
          </strong>

          <span className="mt-2 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#756a60]">
            {label}
          </span>
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#681d2509] text-[#681d25]">
          <Icon
            size={
              17
            }
          />
        </span>
      </div>

      {helper && (
        <p className="mt-4 text-[10px] leading-5 text-[#8a7e73]">
          {helper}
        </p>
      )}

      <ArrowRight
        size={
          15
        }
        className="absolute bottom-4 right-4 text-[#681d25] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
      />
    </Link>
  );
}

function ActionCard({
  to,
  icon: Icon,
  eyebrow,
  title,
  body,
  action
}) {
  return (
    <Link
      to={to}
      className={
        actionCardClass
      }
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#681d2509] text-[#681d25]">
            <Icon
              size={
                18
              }
            />
          </span>

          <ArrowRight
            size={
              16
            }
            className="text-[#681d25] transition group-hover:translate-x-1"
          />
        </div>

        {eyebrow && (
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-1 font-['Cormorant_Garamond'] text-[25px] font-medium leading-tight text-[#2c1a18]">
          {title}
        </h3>

        <p className="mt-2 text-[11px] leading-6 text-[#756a60]">
          {body}
        </p>
      </div>

      {action && (
        <span className="mt-4 text-[11px] font-extrabold text-[#681d25]">
          {action}
        </span>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const [
    data,
    setData
  ] =
    useState(
      null
    );

  const [
    error,
    setError
  ] =
    useState(
      ''
    );

  const notify =
    useToast();

  const {
    t,
    i18n
  } =
    useTranslation();

  useEffect(
    () => {
      let active =
        true;

      api(
        '/dashboard'
      )
        .then(
          (
            response
          ) => {
            if (
              active
            ) {
              setData(
                response.data
              );
            }
          }
        )
        .catch(
          (
            caught
          ) => {
            if (
              active
            ) {
              setError(
                caught.message
              );
            }
          }
        );

      const realtimeRefresh = () => {
        if (!active) return;
        api('/dashboard').then((response) => {
          if (active) setData(response.data);
        }).catch(() => {});
      };
      window.addEventListener('ksm:realtime', realtimeRefresh);
      return () => {
        window.removeEventListener('ksm:realtime', realtimeRefresh);
        active =
          false;
      };
    },
    []
  );

  const membership =
    data?.membership;

  const currentPlan =
    membership
      ?.plan
      ?.name ||
    'Free';

  const planSlug =
    membership
      ?.plan
      ?.slug ||
    'free';

  const isFree =
    planSlug ===
    'free';

  const profileReady =
    Number(
      data?.profileCompletion ||
        0
    ) >=
    100;

  const profilePendingReview =
    data?.profileStatus ===
    'pending_review';

  const profileActive =
    data?.profileStatus ===
    'active';

  const profilePaused =
    data?.lifecycleStatus ===
    'Paused';

  const recommendationHeading =
    useMemo(
      () => {
        if (
          data?.recommendedProfiles
            ?.length
        ) {
          return t(
            'member.recommended'
          );
        }

        return t(
          'member.noRecommendations'
        );
      },
      [
        data?.recommendedProfiles,
        t
      ]
    );

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

        setData(
          (
            current
          ) => ({
            ...current,

            recommendedProfiles:
              current.recommendedProfiles.map(
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
          })
        );

        notify(
          t(
            'member.interestSent'
          )
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

  const shortlist =
    async (
      profile
    ) => {
      if (
        profile.shortlisted
      ) {
        return;
      }

      try {
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

        setData(
          (
            current
          ) => ({
            ...current,

            shortlistCount:
              current.shortlistCount +
              1,

            recommendedProfiles:
              current.recommendedProfiles.map(
                (
                  item
                ) =>
                  item._id ===
                  profile._id
                    ? {
                        ...item,

                        shortlisted:
                          true
                      }
                    : item
              )
          })
        );

        notify(
          t(
            'member.shortlistedToast'
          )
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

  if (
    error
  ) {
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

  if (
    !data
  ) {
    return (
      <div className="page-skeleton">
        {t(
          'member.dashboardLoading'
        )}
      </div>
    );
  }

  if (
    !data.profile
  ) {
    return (
      <div className="grid gap-7">
        <section className="relative overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] px-[clamp(24px,5vw,60px)] py-[clamp(40px,7vw,80px)]">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-[42%] bg-[linear-gradient(90deg,#fffdf8,transparent),url('/assets/member/member-lounge.webp')] bg-cover bg-center opacity-40 max-[767px]:hidden"
          />

          <div className="relative max-w-[650px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#91683f]">
              Welcome
            </p>

            <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(42px,6vw,70px)] font-medium leading-[0.95] text-[#2c1a18]">
              Create your matrimonial profile
            </h1>

            <p className="mt-5 max-w-[560px] text-[13px] leading-[1.9] text-[#756a60]">
              Complete your profile so we can start
              finding compatible matches from the
              community.
            </p>

            <Link
              className={`${primaryButtonClass} mt-7`}
              to="/onboarding"
            >
              Start profile

              <ArrowRight
                size={
                  16
                }
              />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
          <ActionCard
            to="/onboarding"
            icon={
              UserRound
            }
            eyebrow="Step 1"
            title="Build your profile"
            body="Add your personal, family, Rajput lineage, career and lifestyle details."
            action="Start now"
          />

          <ActionCard
            to="/membership"
            icon={
              Crown
            }
            eyebrow={
              currentPlan
            }
            title="Explore membership"
            body="Compare available membership plans and see what features are included."
            action="View plans"
          />

          <ActionCard
            to="/settings"
            icon={
              Settings
            }
            eyebrow="Privacy"
            title="Review your privacy"
            body="Sensitive information stays protected and can be controlled from your settings."
            action="Open settings"
          />
        </section>
      </div>
    );
  }

  return (
    <>
      <header className="relative mb-8 overflow-hidden border border-[#ddd0c1] bg-[#eee4d8]">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(90deg,#eee4d8,transparent),url('/assets/member/member-lounge.webp')] bg-cover bg-center max-[767px]:w-full max-[767px]:opacity-20"
        />

        <div className="relative max-w-[760px] px-[clamp(24px,5vw,48px)] py-[clamp(32px,5vw,52px)]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#91683f]">
              {formatDate(
                new Date(),
                i18n.language,
                {
                  weekday:
                    'long',

                  day:
                    'numeric',

                  month:
                    'long'
                }
              )}
            </p>

            <span className="h-1 w-1 rounded-full bg-[#bba58d]" />

            <Link
              to="/membership"
              className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#681d25]"
            >
              {currentPlan} Plan
            </Link>
          </div>

          <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
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

          <p className="mt-5 max-w-[620px] text-[13px] leading-[1.9] text-[#756a60]">
            {profilePaused
              ? 'Your profile is currently paused and hidden from discovery. You can resume it anytime from Settings.'
              : profilePendingReview
                ? 'Your profile is submitted and waiting for review. You can still update your information while the review is pending.'
                : profileActive
                  ? 'Your profile is active. Review your interests, matches and recommendations below.'
                  : t(
                      'member.recommendationBody'
                    )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className={
                primaryButtonClass
              }
            >
              <Search
                size={
                  15
                }
              />

              Discover profiles
            </Link>

            <Link
              to="/my-profile"
              className={
                outlineButtonClass
              }
            >
              <UserRound
                size={
                  15
                }
              />

              View my profile
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border border-[#ddd0c1] bg-[#fffdf8] p-6 max-[767px]:grid-cols-1">
        <div
          className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full font-['Cormorant_Garamond']"
          style={{
            background:
              `conic-gradient(#681d25 ${data.profileCompletion}%, #e7ded2 0)`
          }}
        >
          <div className="absolute inset-[7px] rounded-full bg-[#fffdf8]" />

          <div className="relative z-[2] flex items-end">
            <strong className="text-[28px] font-semibold text-[#431318]">
              {data.profileCompletion}
            </strong>

            <small className="mb-1 text-[11px] text-[#756a60]">
              %
            </small>
          </div>
        </div>

        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
            Profile strength ·{' '}
            {translateStatus(
              t,
              data.profileStatus
            )}
          </p>

          <h2 className="mt-1 font-['Cormorant_Garamond'] text-[29px] font-medium text-[#2c1a18]">
            {profileReady
              ? 'Your profile is ready'
              : 'Complete your profile'}
          </h2>

          <p className="mt-1 max-w-[600px] text-[11px] leading-5 text-[#756a60]">
            {profileReady
              ? 'Keep your information, photos and preferences updated so your recommendations stay relevant.'
              : 'Complete the remaining profile details to improve visibility and match quality.'}
          </p>
        </div>

        <Link
          className={
            outlineButtonClass
          }
          to="/onboarding"
        >
          {profileReady
            ? 'Edit profile'
            : 'Complete profile'}

          <ArrowRight
            size={
              15
            }
          />
        </Link>
      </section>

      <section className="mt-6 grid grid-cols-5 gap-4 max-[1200px]:grid-cols-3 max-[767px]:grid-cols-2 max-[520px]:grid-cols-1">
        <StatCard
          to="/interests"
          icon={
            HeartHandshake
          }
          value={
            data.newInterestsCount
          }
          label={
            t(
              'member.newInterests'
            )
          }
          helper="Profiles waiting for your response."
        />

        <StatCard
          to="/matches"
          icon={
            UsersRound
          }
          value={
            data.mutualMatchesCount
          }
          label={
            t(
              'member.mutualMatches'
            )
          }
          helper="Accepted connections and active matches."
        />

        <StatCard
          to="/shortlisted"
          icon={
            Bookmark
          }
          value={
            data.shortlistCount
          }
          label={
            t(
              'nav.shortlisted'
            )
          }
          helper="Profiles you saved for later."
        />

        <StatCard
          to="/notifications"
          icon={
            Bell
          }
          value={
            data.unreadNotificationsCount
          }
          label={
            t(
              'member.unread'
            )
          }
          helper="Unread account and match updates."
        />

        <StatCard
  to="/my-profile"
  icon={Eye}
  value={data.profileViewsLast30Days}
  label={t('member.profileViews')}
  helper="Profile views recorded in the last 30 days."
/>
      </section>

      <section className="mt-10 grid grid-cols-[1.5fr_1fr] gap-5 max-[1000px]:grid-cols-1">
        <div className="border border-[#ddd0c1] bg-[#fffdf8] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
                Membership
              </p>

              <h2 className="mt-1 font-['Cormorant_Garamond'] text-[31px] font-medium text-[#2c1a18]">
                {currentPlan} Plan
              </h2>
            </div>

            <Link
              to="/membership"
              className="text-[11px] font-extrabold text-[#681d25]"
            >
              {isFree
                ? 'Compare plans'
                : 'Manage plan'}
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
            <div className="border border-[#eee4d8] p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#8a7e73]">
                Interests remaining
              </p>

              <strong className="mt-2 block font-['Cormorant_Garamond'] text-[31px] font-medium text-[#431318]">
                {formatRemaining(
                  membership
                    ?.usage
                    ?.interestsRemaining
                )}
              </strong>

              <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                Used:{' '}
                {
                  membership
                    ?.usage
                    ?.interestsUsed ??
                  0
                }
              </p>
            </div>

            <div className="border border-[#eee4d8] p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#8a7e73]">
                Contact unlocks remaining
              </p>

              <strong className="mt-2 block font-['Cormorant_Garamond'] text-[31px] font-medium text-[#431318]">
                {formatRemaining(
                  membership
                    ?.usage
                    ?.contactViewsRemaining
                )}
              </strong>

              <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                Used:{' '}
                {
                  membership
                    ?.usage
                    ?.contactViewsUsed ??
                  0
                }
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {membership
              ?.features
              ?.advancedSearch && (
              <span className="rounded-full border border-[#ddd0c1] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5e4e46]">
                Advanced Search
              </span>
            )}

            {membership
              ?.features
              ?.profileBoost && (
              <span className="rounded-full border border-[#ddd0c1] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5e4e46]">
                Profile Boost
              </span>
            )}

            {membership
              ?.features
              ?.prioritySupport && (
              <span className="rounded-full border border-[#ddd0c1] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5e4e46]">
                Priority Support
              </span>
            )}

            {membership
              ?.features
              ?.relationshipManager && (
              <span className="rounded-full border border-[#ddd0c1] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5e4e46]">
                Relationship Manager
              </span>
            )}

            {!membership
              ?.features
              ?.advancedSearch &&
              !membership
                ?.features
                ?.profileBoost &&
              !membership
                ?.features
                ?.prioritySupport &&
              !membership
                ?.features
                ?.relationshipManager && (
                <span className="text-[10px] leading-5 text-[#756a60]">
                  Upgrade to unlock more matchmaking tools.
                </span>
              )}
          </div>
        </div>

        <div className="border border-[#ddd0c1] bg-[#fffdf8] p-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
            Account status
          </p>

          <h2 className="mt-1 font-['Cormorant_Garamond'] text-[29px] font-medium text-[#2c1a18]">
            {profilePaused
              ? 'Profile paused'
              : profilePendingReview
                ? 'Pending review'
                : profileActive
                  ? 'Profile active'
                  : translateStatus(
                      t,
                      data.profileStatus
                    )}
          </h2>

          <p className="mt-3 text-[11px] leading-6 text-[#756a60]">
            {profilePaused
              ? 'Your profile is hidden from discovery until you resume it.'
              : profilePendingReview
                ? 'Your profile is waiting for moderation approval.'
                : 'Your profile is currently available according to your privacy settings.'}
          </p>

          <Link
            to="/settings"
            className={`${outlineButtonClass} mt-5 w-full`}
          >
            <Settings
              size={
                15
              }
            />

            Profile settings
          </Link>
        </div>
      </section>

      <div className="mb-6 mt-[52px] flex items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {t(
              'member.selectedForYou'
            )}
          </p>

          <h2 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
            {recommendationHeading}
          </h2>
        </div>

        <Link
          to="/discover"
          className="flex items-center gap-2 text-[12px] font-extrabold text-[#681d25]"
        >
          {t(
            'actions.viewAll'
          )}

          <ArrowRight
            size={
              16
            }
          />
        </Link>
      </div>

      {data.recommendedProfiles
        .length ? (
        <div className="grid grid-cols-3 gap-5 max-[1024px]:grid-cols-2 max-[767px]:grid-cols-1">
          {data.recommendedProfiles.map(
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
          <Sparkles
            size={
              24
            }
            className="mx-auto mb-4 text-[#91683f]"
          />

          <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
            {t(
              'member.noRecommendations'
            )}
          </p>

          <Link
            to="/preferences"
            className={`${outlineButtonClass} mt-5`}
          >
            Review preferences
          </Link>
        </div>
      )}

      <section className="mt-[55px]">
        <div className="mb-5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
            Quick actions
          </p>

          <h2 className="mt-1 font-['Cormorant_Garamond'] text-[32px] font-medium text-[#2c1a18]">
            Keep your profile moving
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[650px]:grid-cols-1">
          <ActionCard
            to="/discover"
            icon={
              Search
            }
            eyebrow="Discover"
            title="Find profiles"
            body="Browse compatible members based on your preferences."
            action="Start discovering"
          />

          <ActionCard
            to="/interests"
            icon={
              HeartHandshake
            }
            eyebrow="Connections"
            title="Review interests"
            body="Respond to members who have shown interest in your profile."
            action="Open interests"
          />

          <ActionCard
            to="/preferences"
            icon={
              CheckCircle2
            }
            eyebrow="Matching"
            title="Tune preferences"
            body="Keep age, location, education and partner expectations current."
            action="Edit preferences"
          />

          <ActionCard
            to="/settings"
            icon={
              Settings
            }
            eyebrow="Privacy"
            title="Review privacy"
            body="Control who can view sensitive family, income and profile information."
            action="Open privacy"
          />
        </div>
      </section>
    </>
  );
}