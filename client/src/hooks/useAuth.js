import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  loginUser,
  logoutUser,
  fetchCurrentUser,
  refreshToken,
  updateUserPassword,
  clearError,
  clearSuccessMessage,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectUserRole,
  doLogoutAction
} from '@/store/slices/accountSlice';

/**
 * Custom hook for authentication related functionality
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Selectors from Redux store
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const userRole = useSelector(selectUserRole);

  // Check if user is authenticated and fetch user data if needed
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('accessToken')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Login with username and password
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to remember the user
   * @param {Function} onSuccess - Callback on successful login
   * @returns {Promise} Login result
   */
  const login = useCallback(
    async (username, password, rememberMe = false, onSuccess) => {
      try {
        const result = await dispatch(loginUser({ username, password, rememberMe })).unwrap();

        if (onSuccess) {
          onSuccess(result);
        } else {
          // Default navigation: redirect to dashboard based on role
          const redirectTo = location.state?.from || (userRole === 'admin' ? '/admin' : '/');
          navigate(redirectTo, { replace: true });
        }

        return result;
      } catch (error) {
        return { error };
      }
    },
    [dispatch, navigate, location.state?.from, userRole]
  );

  /**
   * Logout the current user
   * @param {Function} onSuccess - Callback on successful logout
   * @returns {Promise} Logout result
   */
  const logout = useCallback(
    async (onSuccess) => {
      try {
        await dispatch(logoutUser()).unwrap();

        // Force logout even if server request fails
        dispatch(doLogoutAction());

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/login');
        }

        return { success: true };
      } catch (error) {
        // Even if server logout fails, we still want to logout client-side
        dispatch(doLogoutAction());
        navigate('/login');
        return { error };
      }
    },
    [dispatch, navigate]
  );

  /**
   * Refresh the authentication token
   * @returns {Promise} Refresh result
   */
  const refreshAuthToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshToken()).unwrap();
      return result;
    } catch (error) {
      return { error };
    }
  }, [dispatch]);

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Password change result
   */
  const changePassword = useCallback(
    async (oldPassword, newPassword) => {
      try {
        const result = await dispatch(updateUserPassword({ oldPassword, newPassword })).unwrap();
        return result;
      } catch (error) {
        return { error };
      }
    },
    [dispatch]
  );

  /**
   * Clear authentication errors
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear success messages
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = useCallback(
    (roles) => {
      if (!userRole) return false;
      if (Array.isArray(roles)) {
        return roles.includes(userRole);
      }
      return userRole === roles;
    },
    [userRole]
  );

  /**
   * Check if user is an admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = useCallback(() => {
    return userRole === 'admin';
  }, [userRole]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    login,
    logout,
    refreshAuthToken,
    changePassword,
    clearAuthError,
    clearSuccess,
    hasRole,
    isAdmin
  };
};

export default useAuth;
