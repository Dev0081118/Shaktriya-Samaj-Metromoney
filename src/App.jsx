import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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

import PublicInfoPage from "./pages/PublicInfoPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import StoriesPage from "./pages/StoriesPage";

import ContactPage from "./pages/ContactPage";
import MemberBenefitsPage from "./pages/MemberBenefitsPage";

import AdminPage from "./pages/admin/AdminPage";
import AdminOperationsPage from "./pages/admin/AdminOperationsPage";
import ManagerOperationsPage from "./pages/admin/ManagerOperationsPage";
import ManagerWorkspacePage from "./pages/admin/ManagerWorkspacePage";
import CustomerOperationsPage from "./pages/admin/CustomerOperationsPage";
import RevenuePage from "./pages/admin/RevenuePage";

import MemberLayout from "./layouts/MemberLayout";

import { getHomeRouteForRole } from "./utils/roleRoutes";

import LanguageSwitcher from "./components/LanguageSwitcher";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="app-loading">
        {t("states.loading")}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to={getHomeRouteForRole(user.role)}
        replace
      />
    );
  }

  return children;
}

function DocumentMeta() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const labels = {
      "/": "Kshatriya Matrimonial Society",
      "/about": t("nav.about"),
      "/how-it-works": t("nav.howItWorks"),
      "/success-stories": t("nav.stories"),
      "/safety": t("public.safety"),
      "/membership": t("nav.membership"),
      "/contact": t("public.contact"),
      "/dashboard": t("nav.dashboard")
    };

    document.title =
      pathname === "/"
        ? labels["/"]
        : `${labels[pathname] || "Kshatriya"} | Kshatriya Matrimonial Society`;
  }, [i18n.language, pathname, t]);

  return null;
}

export default function App() {
  return (
    <>
      <DocumentMeta />

      <LanguageSwitcher global />

      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<AuthPage mode="login" />}
        />

        <Route
          path="/register"
          element={<AuthPage mode="register" />}
        />

        <Route
          path="/forgot-password"
          element={<AuthPage mode="forgot" />}
        />

        <Route
          path="/membership"
          element={<MembershipPage publicView />}
        />

        {/* ======================================
            PUBLIC PAGES
        ======================================= */}

        <Route
          path="/about"
          element={<PublicInfoPage type="about" />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorksPage />}
        />

        <Route
          path="/success-stories"
          element={<StoriesPage />}
        />

        <Route
          path="/safety"
          element={<PublicInfoPage type="safety" />}
        />

        <Route
          path="/privacy"
          element={<PublicInfoPage type="privacy" />}
        />

        <Route
          path="/terms"
          element={<PublicInfoPage type="terms" />}
        />

        <Route
          path="/refunds"
          element={<PublicInfoPage type="refunds" />}
        />

        <Route
          path="/contact"
          element={<ContactPage />}
        />

        {/* ======================================
            MEMBER ONBOARDING
        ======================================= */}

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute roles={["member"]}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* ======================================
            MEMBER ROUTES
        ======================================= */}

        <Route
          element={
            <ProtectedRoute roles={["member"]}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/discover"
            element={<DiscoverPage />}
          />

          <Route
            path="/profile/:profileId"
            element={<ProfilePage />}
          />

          <Route
            path="/my-profile"
            element={<ProfilePage own />}
          />

          <Route
            path="/preferences"
            element={
              <SettingsPage section="preferences" />
            }
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          <Route
            path="/benefits"
            element={<MemberBenefitsPage />}
          />

          <Route
            path="/interests"
            element={
              <CollectionPage type="interests" />
            }
          />

          <Route
            path="/matches"
            element={
              <CollectionPage type="matches" />
            }
          />

          <Route
            path="/shortlisted"
            element={
              <CollectionPage type="shortlisted" />
            }
          />

          <Route
            path="/notifications"
            element={
              <CollectionPage type="notifications" />
            }
          />
        </Route>

        {/* ======================================
            BIODATA
        ======================================= */}

        <Route
          path="/my-profile/biodata"
          element={
            <ProtectedRoute roles={["member"]}>
              <BiodataPage />
            </ProtectedRoute>
          }
        />

        {/* ======================================
            MANAGER
        ======================================= */}

        <Route
          path="/manager/*"
          element={
            <ProtectedRoute
              roles={["relationship_manager"]}
            >
              <ManagerWorkspacePage />
            </ProtectedRoute>
          }
        />

        {/* ======================================
            ADMIN
        ======================================= */}

        <Route
          path="/admin/customers/*"
          element={
            <ProtectedRoute
              roles={["admin", "super_admin"]}
            >
              <CustomerOperationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <RevenuePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/system-health"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AdminOperationsPage type="health" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/support"
          element={
            <ProtectedRoute
              roles={["admin", "super_admin"]}
            >
              <AdminOperationsPage type="support" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/relationship-managers"
          element={
            <ProtectedRoute
              roles={["admin", "super_admin"]}
            >
              <ManagerOperationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AdminOperationsPage type="plans" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute
              roles={["admin", "super_admin"]}
            >
              <AdminOperationsPage type="payments" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AdminOperationsPage type="settings" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AdminOperationsPage type="audit" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "moderator",
                "super_admin"
              ]}
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* ======================================
            FALLBACK
        ======================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}