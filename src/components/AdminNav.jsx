import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNavigation = [
  { group: 'Overview', links: [['/admin', 'Overview', ['moderator', 'admin', 'super_admin']]] },
  { group: 'Customers', links: [
    ['/admin/customers', 'Customers', ['admin', 'super_admin']],
    ['/admin/profiles', 'Profiles', ['moderator', 'admin', 'super_admin']]
  ] },
  { group: 'Matrimonial Operations', links: [
    ['/admin/profiles', 'Moderation', ['moderator', 'admin', 'super_admin']],
    ['/admin/reports', 'Reports', ['moderator', 'admin', 'super_admin']]
  ] },
  { group: 'Customer Operations', links: [
    ['/admin/support', 'Support', ['admin', 'super_admin']],
    ['/admin/relationship-managers', 'Relationship Managers', ['admin', 'super_admin']]
  ] },
  { group: 'Business', links: [
    ['/admin/revenue', 'Revenue', ['super_admin']],
    ['/admin/payments', 'Payments', ['admin', 'super_admin']],
    ['/admin/subscriptions', 'Subscriptions', ['admin', 'super_admin']],
    ['/admin/plans', 'Plans', ['super_admin']]
  ] },
  { group: 'Platform', links: [
    ['/admin/users', 'Staff & Roles', ['super_admin']],
    ['/admin/settings', 'System Settings', ['super_admin']],
    ['/admin/system-health', 'System Health', ['super_admin']],
    ['/admin/audit-logs', 'Audit Logs', ['super_admin']]
  ] }
];
export default function AdminNav() {
  const { user, logout } = useAuth(),
    navigate = useNavigate();
  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return (
    <aside>
      <NavLink to="/admin">
        KSHATRIYA<small>Administration</small>
      </NavLink>
      <nav>
        {adminNavigation.map((section) => {
          const links = section.links.filter(([, , roles]) => roles.includes(user?.role));
          return links.length ? <section key={section.group}>
            <small>{section.group}</small>
            {links.map(([to, label]) => <NavLink end={to === '/admin'} to={to} key={`${section.group}-${label}`}>{label}</NavLink>)}
          </section> : null;
        })}
      </nav>
      <div className="admin-account">
        <span className="admin-identity">
          {user?.email}
          <small>{user?.role?.replace('_', ' ')}</small>
        </span>
        <button type="button" className="admin-logout" onClick={signOut}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}
