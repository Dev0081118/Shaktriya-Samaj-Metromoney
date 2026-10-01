import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const items = [
  ['/admin', 'Overview', ['moderator', 'admin', 'super_admin']],
  ['/admin/profiles', 'Profiles', ['moderator', 'admin', 'super_admin']],
  ['/admin/users', 'Users', ['admin', 'super_admin']],
  ['/admin/reports', 'Reports', ['moderator', 'admin', 'super_admin']],
  ['/admin/support', 'Support', ['admin', 'super_admin']],
  ['/admin/subscriptions', 'Subscriptions', ['admin', 'super_admin']],
  [
    '/admin/relationship-managers',
    'Relationship Managers',
    ['admin', 'super_admin']
  ],
  ['/admin/plans', 'Plans', ['super_admin']],
  ['/admin/payments', 'Payments', ['super_admin']],
  ['/admin/settings', 'System Settings', ['super_admin']],
  ['/admin/audit-logs', 'Audit Logs', ['super_admin']]
];
export default function AdminNav() {
  const { user } = useAuth();
  return (
    <aside>
      <NavLink to="/admin">
        KSHATRIYA<small>Administration</small>
      </NavLink>
      <nav>
        {items
          .filter(([, , roles]) => roles.includes(user?.role))
          .map(([to, label]) => (
            <NavLink end={to === '/admin'} to={to} key={to}>
              {label}
            </NavLink>
          ))}
      </nav>
      <NavLink to="/dashboard">Return to member view</NavLink>
    </aside>
  );
}
