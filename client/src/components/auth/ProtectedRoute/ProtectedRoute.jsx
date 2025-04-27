import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { memo } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = memo(
  ({ children, requireAuth = true, roles = [], redirectPath = '/login', fallbackComponent = null }) => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.account);

    // Show loading state when authentication is being checked
    // if (isLoading) {
    //   return fallbackComponent || <LoadingSpinner />;
    // }

    // Redirect unauthorized users to login with return path
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }

    // Check role-based access
    if (roles.length > 0 && user && !roles.includes(user.role)) {
      return <Navigate to='/unauthorized' state={{ from: location.pathname }} replace />;
    }

    // Redirect authenticated users trying to access login/register pages
    if (!requireAuth && isAuthenticated) {
      // Get the return path or default to dashboard
      // Ensure returnPath is always a string
      const returnPath = typeof location.state?.from === 'string' ? location.state.from : '/';
      return <Navigate to={returnPath} replace />;
    }

    return children;
  }
);

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
  fallbackComponent: PropTypes.node
};

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
