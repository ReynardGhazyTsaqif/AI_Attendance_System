import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import HistoryPage from "./pages/attendance/HistoryPage";
import UsersPage from "./pages/users/UsersPage";
import ExportPage from "./pages/export/ExportPage";
import FaceEnrollPage from "./pages/face/FaceEnrollPage";
import SchedulePage from './pages/schedule/SchedulePage';
import DepartmentPage from './pages/department/DepartmentPage';
import LocationPage from './pages/location/LocationPage';
import "./App.css";

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/attendance" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/dashboard" : "/attendance"}
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <Layout>
              <AttendancePage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/history"
        element={
          <PrivateRoute>
            <Layout>
              <HistoryPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/face-enroll"
        element={
          <PrivateRoute>
            <Layout>
              <FaceEnrollPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <UsersPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/export"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <ExportPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/schedules"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <SchedulePage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/departments" element={
  <PrivateRoute adminOnly>
    <Layout><DepartmentPage /></Layout>
  </PrivateRoute>
} />

<Route path="/locations" element={
  <PrivateRoute adminOnly>
    <Layout><LocationPage /></Layout>
  </PrivateRoute>
} />

      <Route
        path="*"
        element={
          <Navigate
            to={
              user
                ? user.role === "admin"
                  ? "/dashboard"
                  : "/attendance"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
