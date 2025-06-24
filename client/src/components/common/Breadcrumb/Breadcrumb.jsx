import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items, separator, showHome = true }) => {
  const location = useLocation();

  // Nếu không có items được truyền vào, tạo breadcrumb tự động từ URL
  const breadcrumbItems = items || generateBreadcrumbFromURL(location.pathname);

  return (
    <nav aria-label='Breadcrumb' className='mb-4'>
      <ol className='flex flex-wrap items-center gap-2 text-sm'>
        {showHome && (
          <>
            <li>
              <Link to='/' className='flex items-center text-gray-500 transition-colors hover:text-gray-900'>
                <Home size={16} className='mr-1' />
                <span>Trang chủ</span>
              </Link>
            </li>
            {breadcrumbItems.length > 0 && <li className='text-gray-400'>{separator || <ChevronRight size={16} />}</li>}
          </>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.path || index} className='flex items-center'>
              {isLast ? (
                <span className='font-medium text-gray-900'>{item.label}</span>
              ) : (
                <>
                  <Link to={item.path} className='text-gray-500 transition-colors hover:text-gray-900'>
                    {item.label}
                  </Link>
                  <span className='mx-2 text-gray-400'>{separator || <ChevronRight size={16} />}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// function để tạo breadcrumb items từ URL
function generateBreadcrumbFromURL(pathname) {
  // Bỏ qua query params và hash
  const path = pathname.split('?')[0].split('#')[0];

  // Split path và lọc bỏ các phần tử rỗng
  const pathSegments = path.split('/').filter(Boolean);

  if (pathSegments.length === 0) return [];

  // Tạo mảng breadcrumb items
  return pathSegments.map((segment, index) => {
    // Tạo path tích lũy cho mỗi segment
    const path = '/' + pathSegments.slice(0, index + 1).join('/');

    // Format label: capitalize và thay thế dấu gạch ngang bằng khoảng trắng
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { path, label };
  });
}

Breadcrumb.propTypes = {
  // Mảng các item cho breadcrumb, mỗi item có path và label
  items: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string, // đường dẫn để điều hướng
      label: PropTypes.node.isRequired // text hiển thị (có thể là string hoặc element)
    })
  ),
  // Component hoặc string để ngăn cách các items
  separator: PropTypes.node,
  // Có hiển thị link Trang chủ ở đầu không
  showHome: PropTypes.bool
};

export default Breadcrumb;
