import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { memo } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = memo(
  ({ children, requireAuth = true, roles = [], redirectPath = '/login', fallbackComponent = null }) => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.account);

    if (isLoading) {
      return fallbackComponent || <LoadingSpinner fullPage />;
    }
    console.log('vao day');

    // Chuyển hướng người dùng không được xác thực đến trang đăng nhập với đường dẫn trở về
    // Chỉ khi đã hoàn thành việc kiểm tra xác thực (isLoading = false) và user thực sự chưa đăng nhập
    if (requireAuth && !isAuthenticated && !isLoading) {
      return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }
    // Kiểm tra quyền truy cập dựa trên vai trò người dùng
    if (roles.length > 0 && user && !roles.includes(user.role)) {
      console.log('user.role', user.role);
      // Chuyển hướng đến trang unauthorized nếu người dùng không có quyền truy cập
      return <Navigate to='/unauthorized' state={{ from: location.pathname }} replace />;
    }

    // Chuyển hướng người dùng đã đăng nhập khi họ cố gắng truy cập trang đăng nhập/đăng ký
    if (!requireAuth && isAuthenticated) {
      // Lấy đường dẫn trở về hoặc mặc định đến trang chủ
      // Đảm bảo returnPath luôn là một chuỗi
      const returnPath = typeof location.state?.from === 'string' ? location.state.from : '/';
      return <Navigate to={returnPath} replace />;
    }

    return children;
  }
);

// Đặt tên hiển thị cho component (hữu ích cho React DevTools)
ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
