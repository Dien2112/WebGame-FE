import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserDashboard from "./pages/user/UserDashboard";
import AdminStats from "./pages/admin/AdminStats";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGames from "./pages/admin/AdminGames";
import Games from "./pages/user/Games";
import Friends from "./pages/user/Friends";
import Messages from "./pages/user/Messages";
import Ranking from "./pages/user/Ranking";
import Profile from "./pages/user/Profile";
import Achievements from "./pages/user/Achievements";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
      return <Navigate to="/dashboard/games" replace />;
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

          {/* User Dashboard Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/games" element={<Games />} />
            <Route path="/dashboard/friends" element={<Friends />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/ranking" element={<Ranking />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/achievements" element={<Achievements />} />
            {/* Fallback for unknown dashboard routes */}
            <Route path="/dashboard/*" element={<div>Page under construction</div>} />
          </Route>

          {/* Admin Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<Navigate to="/admin/stats" replace />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/games" element={<AdminGames />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
