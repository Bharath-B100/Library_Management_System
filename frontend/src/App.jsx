import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBorrows from './pages/admin/AdminBorrows';

import UserDashboard from './pages/user/UserDashboard';
import UserLibrary from './pages/user/UserLibrary';
import UserMyBooks from './pages/user/UserMyBooks';
import UserHistory from './pages/user/UserHistory';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/admin-register" element={<PublicRoute><AdminRegisterPage /></PublicRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="borrows" element={<AdminBorrows />} />
      </Route>

      <Route path="/user" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="library" element={<UserLibrary />} />
        <Route path="my-books" element={<UserMyBooks />} />
        <Route path="history" element={<UserHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1a1e35', color: '#f0f2ff', border: '1px solid #2a2f52' },
          }} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
