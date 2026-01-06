import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { base44 } from "@/api/base44Client";
import Login from "./pages/Login";

// Client pages
import ClientDashboard from "./pages/ClientDashboard";
import ClientProject from "./pages/ClientProject";
import ClientPhases from "./pages/ClientPhases";
import ClientApprovals from "./pages/ClientApprovals";
import ClientSupport from "./pages/ClientSupport";

// Octalve pages
import OctalveDashboard from "./pages/OctalveDashboard";
import OctalveProjects from "./pages/OctalveProjects";
import OctalveClients from "./pages/OctalveClients";
import OctalveTemplates from "./pages/OctalveTemplates";
import OctalveTeam from "./pages/OctalveTeam";
import OctalveAnalytics from "./pages/OctalveAnalytics";
import OctalveSettings from "./pages/OctalveSettings";

// Shared pages
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import PhaseDetail from "./pages/PhaseDetail";
import UserNotRegisteredError from "./components/UserNotRegisteredError";

function ShellRoute({ pageName, children }) {
  return <Layout currentPageName={pageName}>{children}</Layout>;
}

function AuthGate({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth
      .me()
      .then((u) => mounted && setUser(u))
      .catch(() => mounted && setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Optional: prevent clients from opening Octalve routes.
  const isOctalveRoute = location.pathname.startsWith("/Octalve") || location.pathname.startsWith("/CreateProject") || location.pathname.startsWith("/ProjectDetail") || location.pathname.startsWith("/PhaseDetail");
  if (user.role !== "admin" && isOctalveRoute) {
    // Clients can still view Phase/Project detail in the current UI design.
    // Keep this conservative: only block explicit Octalve pages.
    if (location.pathname.startsWith("/Octalve") || location.pathname.startsWith("/CreateProject")) {
      return <UserNotRegisteredError />;
    }
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <AuthGate>
            <HomeRedirect />
          </AuthGate>
        }
      />

      {/* Client */}
      <Route
        path="/ClientDashboard"
        element={
          <AuthGate>
            <ShellRoute pageName="ClientDashboard">
              <ClientDashboard />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/ClientProject"
        element={
          <AuthGate>
            <ShellRoute pageName="ClientProject">
              <ClientProject />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/ClientPhases"
        element={
          <AuthGate>
            <ShellRoute pageName="ClientPhases">
              <ClientPhases />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/ClientApprovals"
        element={
          <AuthGate>
            <ShellRoute pageName="ClientApprovals">
              <ClientApprovals />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/ClientSupport"
        element={
          <AuthGate>
            <ShellRoute pageName="ClientSupport">
              <ClientSupport />
            </ShellRoute>
          </AuthGate>
        }
      />

      {/* Octalve */}
      <Route
        path="/OctalveDashboard"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveDashboard">
              <OctalveDashboard />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveProjects"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveProjects">
              <OctalveProjects />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveClients"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveClients">
              <OctalveClients />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveTemplates"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveTemplates">
              <OctalveTemplates />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveTeam"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveTeam">
              <OctalveTeam />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveAnalytics"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveAnalytics">
              <OctalveAnalytics />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/OctalveSettings"
        element={
          <AuthGate>
            <ShellRoute pageName="OctalveSettings">
              <OctalveSettings />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/CreateProject"
        element={
          <AuthGate>
            <ShellRoute pageName="CreateProject">
              <CreateProject />
            </ShellRoute>
          </AuthGate>
        }
      />

      {/* Shared detail pages */}
      <Route
        path="/ProjectDetail"
        element={
          <AuthGate>
            <ShellRoute pageName="ProjectDetail">
              <ProjectDetail />
            </ShellRoute>
          </AuthGate>
        }
      />
      <Route
        path="/PhaseDetail"
        element={
          <AuthGate>
            <ShellRoute pageName="PhaseDetail">
              <PhaseDetail />
            </ShellRoute>
          </AuthGate>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomeRedirect() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setTarget(u.role === "admin" ? "/OctalveDashboard" : "/ClientDashboard"))
      .catch(() => setTarget("/login"));
  }, []);

  if (!target) return null;
  return <Navigate to={target} replace />;
}
