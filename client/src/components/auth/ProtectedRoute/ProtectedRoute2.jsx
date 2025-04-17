import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true, roles = [], redirectPath = '/login' }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.account);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect unauthorized users to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to='/unauthorized' state={{ from: location.pathname }} replace />;
  }

  // Redirect authenticated users trying to access login/register pages
  if (!requireAuth && isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string
};

export default ProtectedRoute;
