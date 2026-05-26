import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.auth.user);

  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to a role-appropriate page based on actual role
  const roleRedirects = {
    admin: '/admin/dashboard',
    faculty: '/faculty/dashboard',
    student: '/student/dashboard',
    parent: '/student/dashboard',
  };

  if (user.role && roleRedirects[user.role]) {
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRoute;
