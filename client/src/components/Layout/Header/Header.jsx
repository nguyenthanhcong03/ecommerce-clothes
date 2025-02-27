import React, { useEffect, useState } from 'react';
import { CiHeart } from 'react-icons/ci';
import { FiSearch } from 'react-icons/fi';
import { IoMenuOutline } from 'react-icons/io5';
import { PiShoppingCartLight, PiUserCircleLight } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import Logo from '@assets/images/logocopy.png';
import useScrollHandling from '@hooks/useScrollHandling';
import { toggleSearch } from '@redux/features/searchDrawer/searchSlice';
import { setType, toggleSidebar } from '@redux/features/sidebarDrawer/sidebarSlice';
import MenuItem from '@components/MenuItem/MenuItem';
import { Link } from 'react-router-dom';

function Header() {
  const dispatch = useDispatch();
  const handleToggleSideBar = (type) => {
    dispatch(setType(type));
    dispatch(toggleSidebar());
  };

  const handleToggleSearchModal = () => {
    dispatch(toggleSearch());
  };
  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);

  useEffect(() => {
    setFixedPosition(scrollPosition > 80 ? true : false);
  }, [scrollPosition]);
  return (
    <header
      className={`left-0 right-0 top-0 h-[60px] w-full lg:h-[80px] min-[1537px]:bg-[#FFFFFFE6] min-[1537px]:shadow-shadowHeader ${
        fixedPosition
          ? 'fixed top-[-60px] z-10 translate-y-[60px] bg-[#FFFFFFE6] shadow-shadowHeader backdrop-blur-sm transition-transform duration-500 ease-in lg:top-[-80px] lg:translate-y-[80px]'
          : 'absolute bg-transparent'
      }`}
    >
      {/* Header container */}
      <div className='container mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-4'>
        {/* Logo */}
        <div>
          <img src={Logo} alt='Logo' className='h-[50px] w-[150px] cursor-pointer' />
        </div>

        {/* Navbar */}
        <div className='hidden lg:flex lg:gap-10'>
          <Link to={'/'}>
            <MenuItem text={'TRANG CHỦ'} />
          </Link>
          {/* <Link to={'/shop'}> */}
          <MenuItem text={'SẢN PHẨM'} isMenuDropDown={true} />
          {/* </Link> */}
          <Link to={'/about'}>
            <MenuItem text={'VỀ CHÚNG TÔI'} />
          </Link>
          <Link to={'/news'}>
            <MenuItem text={'TIN TỨC'} />
          </Link>
          <Link to={'/contact'}>
            <MenuItem text={'LIÊN HỆ'} />
          </Link>
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
            <div className='hidden lg:block'>
              <PiUserCircleLight fontSize={26} cursor={'pointer'} />
            </div>
            {/* Menu icon mobile */}
            <div className='lg:hidden' onClick={() => handleToggleSideBar('menu')}>
              <IoMenuOutline fontSize={26} cursor={'pointer'} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
