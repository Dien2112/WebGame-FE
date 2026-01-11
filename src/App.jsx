import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminStats from "./pages/admin/AdminStats";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGames from "./pages/admin/AdminGames";
import Games from "./pages/Games";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import PublicRoute from "./components/PublicRoute";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Strict separation:
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/games"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Games />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/friends"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/stats" replace />}
            />
            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/games"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminGames />
                </ProtectedRoute>
              }
            />
            {/* Add more routes here */}
            <Route path="/dashboard/*" element={<div>Page under construction</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
