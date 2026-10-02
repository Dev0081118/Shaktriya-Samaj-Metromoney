import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { translateRole } from '../utils/translatedLabels';
import AppSidebar from './ui/AppSidebar';
import { getNavigationForRole } from '../config/navigation';
export default function AdminNav() {
  const { user, logout } = useAuth(),
    navigate = useNavigate(),
    { t } = useTranslation();
  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return <AppSidebar
    variant="admin"
    sections={getNavigationForRole(user?.role)}
    identity={{ initial: user?.email?.[0]?.toUpperCase(), primary: user?.email, secondary: translateRole(t, user?.role) }}
    onLogout={signOut}
  />;
}
