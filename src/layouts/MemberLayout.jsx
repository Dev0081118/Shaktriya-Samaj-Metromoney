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

const links = [
  ['/dashboard', 'Dashboard', Home],
  ['/discover', 'Discover', Compass],
  ['/interests', 'Interests', HeartHandshake],
  ['/matches', 'Matches', UserRound],
  ['/shortlisted', 'Shortlisted', Bookmark],
  ['/notifications', 'Notifications', Bell],
  ['/my-profile', 'My Profile', UserRound],
  ['/membership', 'Membership', Crown],
  ['/benefits', 'Plan benefits', Crown],
  ['/settings', 'Settings', Settings]
];
export default function MemberLayout() {
  const [open, setOpen] = useState(false),
    [unread, setUnread] = useState(0),
    [profile, setProfile] = useState(null),
    [plan, setPlan] = useState('Free'),
    [system, setSystem] = useState(null);
  const { user, logout } = useAuth(),
    navigate = useNavigate();
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
        <p className="eyebrow">Scheduled care</p>
        <h1>
          {system.platformName || 'Kshatriya Matrimonial Society'} is briefly
          unavailable.
        </h1>
        <p>
          We are completing maintenance to keep your private member experience
          dependable. Please return shortly.
        </p>
        {system.supportEmail && (
          <a href={`mailto:${system.supportEmail}`}>{system.supportEmail}</a>
        )}
        <button className="outline-button" onClick={signOut}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    );
  return (
    <div className="member-shell">
      <aside className={`member-sidebar ${open ? 'open' : ''}`}>
        <div className="member-brand">
          <NavLink to="/">
            KSHATRIYA<small>Matrimonial Society</small>
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
            <strong>{profile?.firstName || 'Complete your profile'}</strong>
            <small>
              {profile?.profileId || 'Member account'} · {plan}
            </small>
          </div>
        </div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink onClick={() => setOpen(false)} key={to} to={to}>
              <Icon size={17} />
              {label}
              {to === '/notifications' && unread > 0 && (
                <b className="nav-count">{unread}</b>
              )}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={signOut}>
          <LogOut size={17} /> Sign out
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
            <span>Search the community</span>
          </button>
          <div className="topbar-actions">
            <NavLink aria-label="Notifications" to="/notifications">
              <Bell size={18} />
              {unread > 0 && <i />}
            </NavLink>
            <NavLink to="/membership" className="upgrade-link">
              {plan === 'Free' ? 'Explore membership' : plan}
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
