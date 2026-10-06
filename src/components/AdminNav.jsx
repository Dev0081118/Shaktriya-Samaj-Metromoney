import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getNavigationForRole } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { translateRole } from '../utils/translatedLabels';
import AppSidebar from './ui/AppSidebar';

export default function AdminNav() {
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