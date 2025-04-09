import React, { useEffect, useState } from 'react';
import { CiHeart } from 'react-icons/ci';
import { FiSearch } from 'react-icons/fi';
import { IoMenuOutline } from 'react-icons/io5';
import { PiShoppingCartLight, PiUserCircleLight } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '@assets/images/outfitory-logo.png';
import useScrollHandling from '@hooks/useScrollHandling';
import { toggleSearch } from '@redux/features/searchDrawer/searchSlice';
import { setType, toggleSidebar } from '@redux/features/sidebarDrawer/sidebarSlice';
import MenuItem from '@components/MenuItem/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook } from 'react-icons/fa';
import { FaInstagramSquare } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { SiShopee } from 'react-icons/si';
import vnFlag from '@assets/images/icons8-vietnam-48.png';
import usaFlag from '@assets/images/icons8-usa-48.png';
import Language from '../../Language/Language';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const user = useSelector((state) => state.account.user);
  const handleToggleSideBar = (type) => {
    dispatch(setType(type));
    dispatch(toggleSidebar());
  };

  const handleToggleSearchModal = () => {
    dispatch(toggleSearch());
  };
  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);

  // const user = useSelector((state) => state.account.user);
  // const navigate = useNavigate();
  // const handleLogout = async () => {
  //   const res = await callLogout();
  //   if (res && res.data) {
  //     dispatch(doLogoutAction());
  //     message.success('Đăng xuất thành công');
  //     navigate('/');
  //   }
  // };

  useEffect(() => {
    setFixedPosition(scrollPosition > 80 ? true : false);
  }, [scrollPosition]);
  return (
    <header className=''>
      <div className='hidden h-[40px] w-full bg-[#222222] text-sm text-[#B2B2B2] lg:block'>
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between px-4'>
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
              <span>nguyenthanhcong03@hotmail.com</span>
            </div>
            <span>|</span>
            <div>{t('description')}</div>
            {/* <div>Free Shipping for all Order of $99</div> */}
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-4'>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <FaFacebook cursor={'pointer'} />
              </a>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <FaInstagramSquare />
              </a>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <SiZalo />
              </a>
              <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
                <SiShopee />
              </a>
            </div>
            <span>|</span>
            <div className='flex items-center gap-2'>
              <Language />
            </div>
            <span>|</span>
            <div>
              {isAuthenticated ? (
                <div>
                  <div>{user.firstName}</div>
                  <img src={user.avatar} alt='' />
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <PiUserCircleLight fontSize={26} cursor={'pointer'} />
                  <Link to={'/login'}>
                    <button>Đăng nhập</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`h-[60px] w-full lg:h-[80px] ${
          fixedPosition
            ? 'fixed top-[-60px] z-10 translate-y-[60px] bg-[#FFFFFFE6] shadow-shadowHeader backdrop-blur-sm transition-transform duration-500 ease-in lg:top-[-80px] lg:translate-y-[80px]'
            : 'absolute bg-transparent'
        }`}
      >
        {/* Header container */}
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-4'>
          {/* Logo */}
          <Link to={'/'}>
            <img src={Logo} alt='Logo' className='h-[50px] w-[150px] cursor-pointer' />
          </Link>

          {/* Navbar */}
          <div className='hidden lg:flex lg:gap-10'>
            {/* <Link to={'/'}> */}
            <MenuItem text={'TRANG CHỦ'} href={'/'} />
            {/* </Link> */}
            {/* <Link to={'/shop'}> */}
            <MenuItem text={'SẢN PHẨM'} isMenuDropDown={true} href={'/shop'} />
            {/* </Link> */}
            {/* <Link to={'/about'}> */}
            <MenuItem text={'VỀ CHÚNG TÔI'} href={'/about'} />
            {/* </Link> */}
            {/* <Link to={'/news'}> */}
            <MenuItem text={'TIN TỨC'} href={'/news'} />
            {/* </Link> */}
            {/* <Link to={'/contact'}> */}
            <MenuItem text={'LIÊN HỆ'} href={'/contact'} />
            {/* </Link> */}
          </div>

          {/* Function icon */}
          <div className='flex gap-4'>
            {/* Search */}
            <div className='flex items-center'>
              {/* Search mobile */}
              <FiSearch
                className='lg:hidden'
                fontSize={20}
                cursor={'pointer'}
                onClick={() => handleToggleSideBar('search')}
              />
              {/* Search Desktop */}
              <div className='flex items-center gap-2' onClick={() => handleToggleSearchModal()}>
                <FiSearch className='hidden lg:block' fontSize={20} cursor={'pointer'} />
                {/* <input
                  className='hidden rounded-2xl border-[1px] border-[#e1e1e1] bg-inherit px-[10px] py-[4px] text-sm outline-none xl:block'
                  type='text'
                  placeholder='Tìm kiếm sản phẩm...'
                /> */}
              </div>
            </div>

            {/* Wishlist, Cart, Account  */}
            <div className='flex items-center gap-2'>
              {/* Wishlist icon */}
              <div className='hidden lg:block' onClick={() => handleToggleSideBar('wishlist')}>
                <CiHeart fontSize={28} cursor={'pointer'} />
              </div>
              {/* Cart icon */}
              <div onClick={() => handleToggleSideBar('cart')}>
                <PiShoppingCartLight fontSize={24} cursor={'pointer'} />
              </div>
              {/* Account icon */}
              {/* <div className='hidden lg:block'>
                <PiUserCircleLight fontSize={26} cursor={'pointer'} />
              </div> */}
              {/* Menu icon mobile */}
              <div className='lg:hidden' onClick={() => handleToggleSideBar('menu')}>
                <IoMenuOutline fontSize={26} cursor={'pointer'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
