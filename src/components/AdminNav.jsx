import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

import { getNavigationForRole } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { translateRole } from '../utils/translatedLabels';
import AppSidebar from './ui/AppSidebar';

export default function AdminNav() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let active = true;
    const refresh = () => { api('/admin/notifications').then(r => { if (active) setUnread(r.data?.unreadCount || 0); }).catch(() => {}); };
    refresh();
    const onRealtime = () => refresh();
    window.addEventListener('ksm:realtime', onRealtime);
    return () => { active = false; window.removeEventListener('ksm:realtime', onRealtime); };
  }, []);
  const {
    user,
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const { t } =
    useTranslation();

  const signOut = async () => {
    await logout();

    navigate(
      '/login',
      {
        replace: true
      }
    );
  };

  return (
    <AppSidebar
      variant="admin"
      badges={{ notifications: unread }}
      sections={getNavigationForRole(
        user?.role
      )}
      identity={{
        initial:
          user?.email?.[0]?.toUpperCase(),
        primary:
          user?.email,
        secondary:
          translateRole(
            t,
            user?.role
          )
      }}
      onLogout={signOut}
    />
  );
}