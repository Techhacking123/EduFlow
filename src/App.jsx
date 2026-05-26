import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import AdminLayout from './layouts/AdminLayout';
import ParentLayout from './layouts/ParentLayout';
import PrivateRoute from './guards/PrivateRoute';
import RoleRoute from './guards/RoleRoute';

function App() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Helper: determine the home path for the current user's role
  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'faculty') return '/faculty';
    if (user.role === 'parent') return '/parent';
    return '/student';
  };

  return (
    <Routes>
      {/* Auth pages: redirect away if already logged in */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Register />} />

      <Route
        path="/student/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['student']}>
              <StudentLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/parent/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['parent']}>
              <ParentLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/faculty/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['faculty']}>
              <FacultyLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Root: redirect to portal or login */}
      <Route path="/" element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
