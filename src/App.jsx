import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import DiscoverPage from "./pages/DiscoverPage";
import ProfilePage from "./pages/ProfilePage";
import CollectionPage from "./pages/CollectionPage";
import SettingsPage from "./pages/SettingsPage";
import MembershipPage from "./pages/MembershipPage";
import BiodataPage from "./pages/BiodataPage";
import AdminPage from "./pages/admin/AdminPage";
import MemberLayout from "./layouts/MemberLayout";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Preparing your private space…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/profile/:profileId" element={<ProfilePage />} />
      <Route path="/my-profile" element={<ProfilePage own />} />
      <Route path="/preferences" element={<SettingsPage section="preferences" />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/interests" element={<CollectionPage type="interests" />} />
      <Route path="/matches" element={<CollectionPage type="matches" />} />
      <Route path="/shortlisted" element={<CollectionPage type="shortlisted" />} />
      <Route path="/notifications" element={<CollectionPage type="notifications" />} />
      <Route path="/membership" element={<MembershipPage />} />
    </Route>
    <Route path="/my-profile/biodata" element={<ProtectedRoute><BiodataPage /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute roles={["admin", "moderator", "super_admin"]}><AdminPage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
