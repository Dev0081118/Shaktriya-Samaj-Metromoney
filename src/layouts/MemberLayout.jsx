import {
  Bell,
  LogOut,
  Search,
  Wrench
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import AppSidebar from '../components/ui/AppSidebar';
import { getNavigationForRole } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import {
  api,
  assetUrl
} from '../services/api';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white';

export default function MemberLayout() {
  const [unread, setUnread] =
    useState(0);

  const [profile, setProfile] =
    useState(null);

  const [plan, setPlan] =
    useState('Free');

  const [system, setSystem] =
    useState(null);

  const {
    user,
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const { t } =
    useTranslation();

  const loadMembership =
    useCallback(() => {
      return api('/entitlements')
        .then((result) =>
          setPlan(
            result.data.entitlements.plan.name
          )
        )
        .catch(() => {});
    }, []);

  useEffect(() => {
    api('/public/system-status')
      .then((result) =>
        setSystem(result.data)
      )
      .catch(() =>
        setSystem({
          maintenanceMode: false
        })
      );

    Promise.allSettled([
      api('/notifications'),
      api('/profiles/me')
    ]).then(
      ([
        notifications,
        profileResult
      ]) => {
        if (
          notifications.status ===
          'fulfilled'
        ) {
          setUnread(
            notifications.value.data
              .unreadCount
          );
        }

        if (
          profileResult.status ===
          'fulfilled'
        ) {
          setProfile(
            profileResult.value.data
              .profile
          );
        }
      }
    );

    loadMembership();

    window.addEventListener(
      'ksm:entitlements-updated',
      loadMembership
    );

    return () => {
      window.removeEventListener(
        'ksm:entitlements-updated',
        loadMembership
      );
    };
  }, [loadMembership]);

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  if (
    system?.maintenanceMode &&
    ![
      'admin',
      'moderator',
      'super_admin'
    ].includes(user?.role)
  ) {
    return (
      <div className="mx-auto grid min-h-screen max-w-[720px] place-content-center gap-4 p-8 text-center">
        <Wrench
          size={38}
          className="mx-auto text-[#7c2d35]"
        />

        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          {t(
            'member.scheduledCare'
          )}
        </p>

        <h1 className="font-['Cormorant_Garamond'] text-[clamp(42px,6vw,70px)] font-medium leading-[0.98] text-[#431318]">
          {system.platformName ||
            'Kshatriya Matrimonial Society'}{' '}
          {t(
            'member.maintenanceTitle'
          )}
        </h1>

        <p className="mx-auto max-w-[540px] text-[13px] leading-[1.8] text-[#756a60]">
          {t(
            'member.maintenanceBody'
          )}
        </p>

        {system.supportEmail && (
          <a
            href={`mailto:${system.supportEmail}`}
            className="text-[12px] font-extrabold text-[#681d25]"
          >
            {system.supportEmail}
          </a>
        )}

        <button
          className={`${outlineButtonClass} justify-self-center`}
          onClick={signOut}
        >
          <LogOut size={16} />

          {t(
            'actions.signOut'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="member-shell min-h-screen bg-[#f5f0e8]">
      <AppSidebar
        variant="member"
        sections={getNavigationForRole(
          'member'
        )}
        badges={{
          notifications: unread
        }}
        identity={{
          image:
            profile?.profilePhoto
              ? assetUrl(
                  profile.profilePhoto
                )
              : '',

          initial:
            profile?.firstName?.[0] ||
            user?.email?.[0]?.toUpperCase(),

          primary:
            profile?.firstName ||
            t(
              'member.completeProfile'
            ),

          secondary: `${
            profile?.profileId ||
            t(
              'member.memberAccount'
            )
          } · ${plan}`
        }}
        onLogout={signOut}
      />

      <div className="member-main">
        <header className="member-topbar flex h-[78px] items-center justify-between border-b border-[#e4dacf] bg-[#fffdf8] px-[clamp(20px,4vw,60px)]">
          <button
            type="button"
            className="flex items-center gap-[10px] text-[11px] text-[#756a60] max-[1024px]:ml-5"
            onClick={() =>
              navigate('/discover')
            }
          >
            <Search size={16} />

            <span className="max-[767px]:hidden">
              {t(
                'member.searchCommunity'
              )}
            </span>
          </button>

          <div className="ml-auto flex items-center gap-[18px] max-[767px]:gap-3">
            <NavLink
              aria-label={t(
                'nav.notifications'
              )}
              to="/notifications"
              className="relative text-[#431318]"
            >
              <Bell size={18} />

              {unread > 0 && (
                <i className="absolute -right-[2px] -top-px h-[6px] w-[6px] rounded-full bg-[#681d25]" />
              )}
            </NavLink>

            <NavLink
              to="/membership"
              className="rounded-full border border-[#681d25] px-[17px] py-[9px] text-[10px] font-extrabold text-[#681d25] max-[767px]:px-3 max-[767px]:py-2"
            >
              {plan === 'Free'
                ? t(
                    'member.exploreMembership'
                  )
                : plan}
            </NavLink>
          </div>
        </header>

        <main className="mx-auto max-w-[1450px] p-[clamp(35px,5vw,68px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}