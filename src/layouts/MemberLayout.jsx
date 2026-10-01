import {
  Bell,
  Bookmark,
  Compass,
  Crown,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
  Search,
  Wrench
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';
import { useTranslation } from 'react-i18next';

const links = [
  ['/dashboard', 'nav.dashboard', Home], ['/discover', 'nav.discover', Compass],
  ['/interests', 'nav.interests', HeartHandshake], ['/matches', 'nav.matches', UserRound],
  ['/shortlisted', 'nav.shortlisted', Bookmark], ['/notifications', 'nav.notifications', Bell],
  ['/my-profile', 'nav.myProfile', UserRound], ['/membership', 'nav.membership', Crown],
  ['/benefits', 'nav.benefits', Crown], ['/settings', 'nav.settings', Settings]
];
export default function MemberLayout() {
  const [open, setOpen] = useState(false),
    [unread, setUnread] = useState(0),
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
      <aside className={`member-sidebar ${open ? 'open' : ''}`}>
        <div className="member-brand">
          <NavLink to="/">
            KSHATRIYA<small>{t('brand.society')}</small>
          </NavLink>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="mobile-close"
          >
            <X />
          </button>
        </div>
        <div className="member-identity">
          {profile?.profilePhoto ? (
            <img src={assetUrl(profile.profilePhoto)} alt="" />
          ) : (
            <span>
              {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          )}
          <div>
            <strong>{profile?.firstName || t('member.completeProfile')}</strong>
            <small>
              {profile?.profileId || t('member.memberAccount')} · {plan}
            </small>
          </div>
        </div>
        <nav>
          {links.map(([to, key, Icon]) => (
            <NavLink onClick={() => setOpen(false)} key={to} to={to}>
              <Icon size={17} />
              {t(key)}
              {to === '/notifications' && unread > 0 && (
                <b className="nav-count">{unread}</b>
              )}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={signOut}>
          <LogOut size={17} /> {t('actions.signOut')}
        </button>
      </aside>
      <div className="member-main">
        <header className="member-topbar">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="mobile-menu"
          >
            <Menu />
          </button>
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
