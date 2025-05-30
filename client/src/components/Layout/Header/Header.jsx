import Logo from '@/assets/images/outfitory-logo.png';
import avatarDefault from '@/assets/images/user.png';
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import UserDropdown from '@/components/layout/Header/UserDropdown/UserDropdown';
import useScrollHandling from '@/hooks/useScrollHandling';
import { callLogout } from '@/services/authService';
import { doLogoutAction } from '@/store/slices/accountSlice';
import { toggleSearchModal } from '@/store/slices/searchSlice';
import { setType, toggleSidebar } from '@/store/slices/sidebarSlice';
import { SHOP_EMAIL } from '@/utils/constants';
import { Tooltip } from 'antd';
import { CircleUserRound, Facebook, Heart, Instagram, Menu, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.account);
  const { totalCartItems } = useSelector((state) => state.cart);
  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);
  const [isShowUserDropdown, setIsShowUserDropdown] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleToggleSideBar = (type) => {
    if (
      (location.pathname !== '/cart' && type === 'cart') ||
      (location.pathname !== '/wishlist' && type === 'wishlist') ||
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

  const navigate = useNavigate();
  const handleLogout = async () => {
    const res = await callLogout();
    if (res) {
      dispatch(doLogoutAction());
      console.log('đăng xuất');
      // message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  useEffect(() => {
    setFixedPosition(scrollPosition > 80 ? true : false);
  }, [scrollPosition]);
  return (
    <header>
      <div className='hidden h-[40px] w-full bg-[#222222] text-sm text-[#B2B2B2] lg:block'>
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between px-5'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='size-4'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z'
                />
              </svg>
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
          fixedPosition
            ? 'fixed top-[-60px] z-10 translate-y-[60px] bg-[#FFFFFFE6] shadow-shadowHeader backdrop-blur-sm transition-transform duration-500 ease-in lg:top-[-80px] lg:translate-y-[80px]'
            : `absolute ${isHomePage ? 'bg-transparent' : 'bg-white shadow-shadowHeader'}`
        }`}
      >
        {/* Header container */}
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-5'>
          {/* Logo */}
          <Link to={'/'}>
            <img src={Logo} alt='Logo' className='h-[50px] w-[150px] cursor-pointer' />
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
          <div className='flex gap-4'>
            {/* Search */}
            <div className='flex items-center'>
              {/* Search mobile */}
              <Search
                className='lg:hidden'
                fontSize={20}
                cursor={'pointer'}
                onClick={() => handleToggleSideBar('search')}
              />
              {/* Search Desktop */}
              <div className='flex items-center gap-2' onClick={() => handleToggleSearchModal()}>
                <Search className='hidden lg:block' fontSize={20} cursor={'pointer'} />
              </div>
            </div>

            {/* Wishlist, Cart, Account  */}
            <div className='flex items-center gap-2'>
              {isAuthenticated && user?.role === 'admin' ? (
                <></>
              ) : (
                <>
                  {/* Wishlist icon */}
                  <div className='hidden lg:block' onClick={() => handleToggleSideBar('wishlist')}>
                    <Heart fontSize={28} cursor={'pointer'} />
                  </div>
                  {/* Cart icon */}
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
                </>
              )}

              <div className='lg:hidden' onClick={() => handleToggleSideBar('menu')}>
                <Menu fontSize={26} cursor={'pointer'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
