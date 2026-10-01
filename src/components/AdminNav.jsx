import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { translateRole } from '../utils/translatedLabels';

const adminNavigation = [
  { group: 'admin.overview', links: [['/admin', 'admin.overview', ['moderator', 'admin', 'super_admin']]] },
  { group: 'admin.groups.customers', links: [
    ['/admin/customers', 'admin.customers', ['admin', 'super_admin']],
    ['/admin/profiles', 'admin.profiles', ['moderator', 'admin', 'super_admin']]
  ] },
  { group: 'admin.groups.matrimonial', links: [
    ['/admin/profiles', 'admin.moderation', ['moderator', 'admin', 'super_admin']],
    ['/admin/reports', 'admin.reports', ['moderator', 'admin', 'super_admin']]
  ] },
  { group: 'admin.groups.customerOps', links: [
    ['/admin/support', 'admin.support', ['admin', 'super_admin']],
    ['/admin/relationship-managers', 'admin.relationshipManagers', ['admin', 'super_admin']]
  ] },
  { group: 'admin.groups.business', links: [
    ['/admin/revenue', 'admin.revenue', ['super_admin']],
    ['/admin/payments', 'admin.payments', ['admin', 'super_admin']],
    ['/admin/subscriptions', 'admin.subscriptions', ['admin', 'super_admin']],
    ['/admin/plans', 'admin.plans', ['super_admin']]
  ] },
  { group: 'admin.groups.platform', links: [
    ['/admin/users', 'admin.staffRoles', ['super_admin']],
    ['/admin/settings', 'admin.systemSettings', ['super_admin']],
    ['/admin/system-health', 'admin.systemHealth', ['super_admin']],
    ['/admin/audit-logs', 'admin.auditLogs', ['super_admin']]
  ] }
];
export default function AdminNav() {
  const { user, logout } = useAuth(),
    navigate = useNavigate(),
    { t } = useTranslation();
  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return (
    <aside>
      <NavLink to="/admin">
        KSHATRIYA<small>{t('brand.administration')}</small>
      </NavLink>
      <nav>
        {adminNavigation.map((section) => {
          const links = section.links.filter(([, , roles]) => roles.includes(user?.role));
          return links.length ? <section key={section.group}>
            <small>{t(section.group)}</small>
            {links.map(([to, key]) => <NavLink end={to === '/admin'} to={to} key={`${section.group}-${key}`}>{t(key)}</NavLink>)}
          </section> : null;
        })}
      </nav>
      <div className="admin-account">
        <span className="admin-identity">
          {user?.email}
          <small>{translateRole(t, user?.role)}</small>
        </span>
        <button type="button" className="admin-logout" onClick={signOut}>
          <LogOut size={15} /> {t('admin.logout')}
        </button>
      </div>
    </aside>
  );
}
