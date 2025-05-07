import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { memo } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = memo(
  ({ children, requireAuth = true, roles = [], redirectPath = '/login', fallbackComponent = null }) => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.account);

    // // Hiển thị trạng thái loading khi đang kiểm tra xác thực
    if (isLoading) {
      return fallbackComponent || <LoadingSpinner fullPage />;
    }

    // Chuyển hướng người dùng không được xác thực đến trang đăng nhập với đường dẫn trở về
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }

    // Kiểm tra quyền truy cập dựa trên vai trò người dùng
    if (roles.length > 0 && user && !roles.includes(user.role)) {
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

    // Hiển thị nội dung của route nếu người dùng có quyền truy cập
    return children;
  }
);

// Định nghĩa kiểu dữ liệu cho các props
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // Nội dung con sẽ được hiển thị nếu điều kiện đáp ứng
  requireAuth: PropTypes.bool, // Có yêu cầu xác thực hay không
  roles: PropTypes.arrayOf(PropTypes.string), // Danh sách các vai trò được phép truy cập
  redirectPath: PropTypes.string, // Đường dẫn chuyển hướng khi không có quyền
  fallbackComponent: PropTypes.node // Component hiển thị khi đang kiểm tra xác thực
};

// Đặt tên hiển thị cho component (hữu ích cho React DevTools)
ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
