import Logo from '@/assets/images/outfitory-logo.png';
import avatarDefault from '@/assets/images/user.png';
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import UserDropdown from '@/components/layout/Header/UserDropdown/UserDropdown';
import { logoutUser } from '@/store/slices/accountSlice';
import { toggleSearchModal } from '@/store/slices/searchSlice';
import { setType, toggleSidebar } from '@/store/slices/sidebarSlice';
import { SHOP_EMAIL } from '@/utils/constants';
import { message, Tooltip } from 'antd';
import { CircleUserRound, Facebook, Instagram, Mail, Menu, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.account);
  const { totalCartItems } = useSelector((state) => state.cart);
  const [isShowUserDropdown, setIsShowUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleToggleSideBar = (type) => {
    if (
      (location.pathname !== '/cart' && type === 'cart') ||
      (location.pathname !== '/search' && type === 'search') ||
      type === 'menu'
    ) {
      dispatch(setType(type));
      dispatch(toggleSidebar());
    }
  };

  const handleToggleSearchModal = () => {
    dispatch(toggleSearchModal());
  };

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      message.success('Đăng xuất thành công');
      // Chuyển hướng về trang chủ sau khi đăng xuất
      // Reset toàn bộ Redux state
      dispatch({ type: 'RESET_ALL' });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Đăng xuất không thành công, vui lòng thử lại sau');
      return;
    }
  };

  // Xử lý scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header>
      <div className='hidden h-[40px] w-full bg-[#222222] text-sm text-[#B2B2B2] lg:block'>
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between px-5'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Mail width={18} />
              <a href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a>
            </div>
            <span>|</span>
            <div>Freeship đơn từ 99k</div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <Facebook width={18} height={18} />
              </a>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <Instagram width={18} height={18} />
              </a>
            </div>
            <span>|</span>
            <div className='flex items-center gap-2'>
              <LanguageSwitcher />
            </div>
            <span>|</span>
            <div>
              {isAuthenticated && user ? (
                <div
                  className='relative'
                  onMouseEnter={() => setIsShowUserDropdown(true)}
                  onMouseLeave={() => setIsShowUserDropdown(false)}
                >
                  <div className='flex cursor-pointer items-center gap-2'>
                    <img
                      src={user?.avatar ? user.avatar : avatarDefault}
                      alt=''
                      className='h-[25px] w-[25px] rounded-full'
                    />
                    <div>{user.firstName}</div>
                  </div>
                  {isShowUserDropdown && <UserDropdown handleLogout={handleLogout} />}
                </div>
              ) : (
                <Link to={'/login'} className='flex items-center gap-2'>
                  <CircleUserRound />
                  <button>Đăng nhập</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`h-[60px] w-full lg:h-[80px] ${
          isScrolled
            ? 'fixed top-[-60px] z-10 translate-y-[60px] bg-white/90 shadow-shadowHeader backdrop-blur-sm duration-500 ease-in'
            : `absolute ${isHomePage ? 'bg-transparent' : 'bg-white shadow-shadowHeader'}`
        }`}
      >
        {/* Header container */}
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-5'>
          <div className='lg:hidden' onClick={() => handleToggleSideBar('menu')}>
            <Menu fontSize={26} cursor={'pointer'} />
          </div>
          {/* Logo */}
          <Link to={'/'} className='absolute left-1/2 -translate-x-1/2 transform lg:static lg:transform-none'>
            <img src={Logo} alt='Logo' className='h-[80px] transition-transform duration-300 hover:scale-110' />
          </Link>

          {/* Navbar */}
          <div className='hidden lg:flex lg:gap-10'>
            <MenuItem text={'TRANG CHỦ'} href={'/'} />
            <MenuItem text={'SẢN PHẨM'} isMenuDropDown={true} href={'/shop'} />
            <MenuItem text={'VỀ CHÚNG TÔI'} href={'/about'} />
            <MenuItem text={'TIN TỨC'} href={'/news'} />
            <MenuItem text={'LIÊN HỆ'} href={'/contact'} />
          </div>

          {/* Function icon */}
          <div className='flex items-center gap-4'>
            {/* Search mobile */}
            <Search
              className='lg:hidden'
              fontSize={20}
              cursor={'pointer'}
              onClick={() => handleToggleSideBar('search')}
            />
            {/* Search Desktop */}
            <Search
              className='hidden lg:block'
              fontSize={20}
              cursor={'pointer'}
              onClick={() => handleToggleSearchModal()}
            />

            {/*  Cart, Account  */}
            {!isAdmin && (
              <Tooltip
                title={
                  totalCartItems >= 1 ? (
                    <span className='font-robotoMono'>Có {totalCartItems} sản phẩm trong giỏ hàng</span>
                  ) : (
                    <span className='font-robotoMono'>Không có sản phẩm nào trong giỏ hàng</span>
                  )
                }
                placement='bottom'
              >
                <div
                  className='relative cursor-pointer'
                  onClick={() => {
                    handleToggleSideBar('cart');
                  }}
                >
                  <ShoppingCart />
                  {totalCartItems >= 1 && (
                    <div className='absolute bottom-3 left-3 h-5 w-5 rounded-full bg-primaryColor text-center text-xs leading-5 text-white'>
                      {totalCartItems}
                    </div>
                  )}
                </div>
              </Tooltip>
            )}
            <Link to={'user/profile'} className='lg:hidden'>
              <img src={user?.avatar ? user.avatar : avatarDefault} alt='' className='h-[25px] w-[25px] rounded-full' />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
