import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop({ children }) {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top khi route thay đổi
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Thêm sự kiện scroll để hiển thị nút khi cuộn xuống
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top khi nhấn nút
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Layout */}
      {children}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primaryColor text-white shadow-lg transition-all hover:scale-105 hover:bg-primaryColor/90 active:scale-95'
          aria-label='Scroll to top'
        >
          <ArrowUp className='h-6 w-6' />
        </button>
      )}
    </>
  );
}

ScrollToTop.propTypes = {
  children: PropTypes.node
};
