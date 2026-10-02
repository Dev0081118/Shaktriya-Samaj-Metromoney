import {
  Bell,
  LogOut,
  Search,
  Wrench
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
import AppSidebar from '../components/ui/AppSidebar';
import { getNavigationForRole } from '../config/navigation';

export default function MemberLayout() {
  const [unread, setUnread] = useState(0),
    [profile, setProfile] = useState(null),
    [plan, setPlan] = useState('Free'),
    [system, setSystem] = useState(null);
  const { user, logout } = useAuth(),
    navigate = useNavigate(),
    { t } = useTranslation();
  const loadMembership = useCallback(
    () =>
      api('/entitlements')
        .then((result) => setPlan(result.data.entitlements.plan.name))
        .catch(() => {}),
    []
  );
  useEffect(() => {
    api('/public/system-status')
      .then((result) => setSystem(result.data))
      .catch(() => setSystem({ maintenanceMode: false }));
    Promise.allSettled([api('/notifications'), api('/profiles/me')]).then(
      ([notifications, profileResult]) => {
        if (notifications.status === 'fulfilled')
          setUnread(notifications.value.data.unreadCount);
        if (profileResult.status === 'fulfilled')
          setProfile(profileResult.value.data.profile);
      }
    );
    loadMembership();
    window.addEventListener('ksm:entitlements-updated', loadMembership);
    return () =>
      window.removeEventListener('ksm:entitlements-updated', loadMembership);
  }, [loadMembership]);
  const signOut = async () => {
    await logout();
    navigate('/');
  };
  if (
    system?.maintenanceMode &&
    !['admin', 'moderator', 'super_admin'].includes(user?.role)
  )
    return (
      <div className="maintenance-screen">
        <Wrench size={38} />
        <p className="eyebrow">{t('member.scheduledCare')}</p>
        <h1>
          {system.platformName || 'Kshatriya Matrimonial Society'} is briefly
          {t('member.maintenanceTitle')}
        </h1>
        <p>
          {t('member.maintenanceBody')}
        </p>
        {system.supportEmail && (
          <a href={`mailto:${system.supportEmail}`}>{system.supportEmail}</a>
        )}
        <button className="outline-button" onClick={signOut}>
          <LogOut size={16} /> {t('actions.signOut')}
        </button>
      </div>
    );
  return (
    <div className="member-shell">
      <AppSidebar
        variant="member"
        sections={getNavigationForRole('member')}
        badges={{ notifications: unread }}
        identity={{
          image: profile?.profilePhoto ? assetUrl(profile.profilePhoto) : '',
          initial: profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase(),
          primary: profile?.firstName || t('member.completeProfile'),
          secondary: `${profile?.profileId || t('member.memberAccount')} · ${plan}`
        }}
        onLogout={signOut}
      />
      <div className="member-main">
        <header className="member-topbar">
          <button
            className="member-search"
            onClick={() => navigate('/discover')}
          >
            <Search size={16} />
            <span>{t('member.searchCommunity')}</span>
          </button>
          <div className="topbar-actions">
            <NavLink aria-label={t('nav.notifications')} to="/notifications">
              <Bell size={18} />
              {unread > 0 && <i />}
            </NavLink>
            <NavLink to="/membership" className="upgrade-link">
              {plan === 'Free' ? t('member.exploreMembership') : plan}
            </NavLink>
          </div>
        </header>
        <main className="member-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
