import React, { useContext, useEffect, useState } from 'react';
import Logo2 from '../../assets/images/Logo-retina.png';
import Logo from '../../assets/images/logocopy.png';
import { FiSearch } from 'react-icons/fi';
import { CiHeart } from 'react-icons/ci';
import { PiShoppingCartLight } from 'react-icons/pi';
import { PiUserCircleLight } from 'react-icons/pi';
import { IoMenuOutline } from 'react-icons/io5';
import MenuItem from '../MenuItem/MenuItem';
import { SideBarContext } from '../../contexts/SideBarProvider';
import useScrollHandling from '../../hooks/useScrollHandling';
import SearchModal from '../SearchModal/SearchModal';
import Dropdown from '../Dropdown/Dropdown';

function Header() {
  const { isOpen, setIsOpen, type, setType } = useContext(SideBarContext);
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);

  // Hàm mở SideBar
  const handleOpenSideBar = (type) => {
    setIsOpen(true);
    setType(type);
  };

  // Hàm mở thanh tìm kiếm khi ở màn Laptop
  const handleOpenSearchModal = () => {
    setIsOpenSearch(true);
  };

  useEffect(() => {
    setFixedPosition(scrollPosition > 80 ? true : false);
  }, [scrollPosition]);
  return (
    <div>
      {/* Modal tìm kiếm trượt từ trên xuống */}
      <SearchModal isOpenSearch={isOpenSearch} setIsOpenSearch={setIsOpenSearch} />

      {/* Header */}
      <div
        className={`absolute left-0 right-0 top-0 h-[60px] w-full bg-transparent lg:h-[80px] min-[1537px]:bg-[#FFFFFFE6] min-[1537px]:shadow-shadowHeader ${
          fixedPosition
            ? '!fixed top-[-60px] z-10 translate-y-[60px] !bg-[#FFFFFFE6] shadow-shadowHeader backdrop-blur-sm transition-transform duration-500 ease-in lg:top-[-80px] lg:translate-y-[80px]'
            : ''
        }`}
      >
        {/* Header container */}
        <div className='container mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-4'>
          {/* Logo */}
          <div>
            <img src={Logo} alt='' className='h-[50px] w-[150px]' onClick={() => handleOpenSideBar('menu')} />
          </div>

          {/* Menu */}
          <div className='hidden lg:flex lg:gap-10'>
            <div className='w-fit text-base text-primaryColor'>
              <MenuItem text={'TRANG CHỦ'} href={'/'} />
            </div>
            <div className='w-fit text-base text-primaryColor'>
              <MenuItem text={'SẢN PHẨM'} href={'/'} isMenuDropDown={true} />
            </div>
            <div className='w-fit text-base text-primaryColor'>
              <MenuItem text={'KHUYẾN MÃI'} href={'/'} />
            </div>
            <div className='w-fit text-base text-primaryColor'>
              <MenuItem text={'TIN TỨC'} href={'/'} />
            </div>
            <div className='w-fit text-base text-primaryColor'>
              <MenuItem text={'LIÊN HỆ'} href={'/'} />
            </div>
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
                onClick={() => handleOpenSideBar('search')}
              />
              {/* Search Desktop */}
              <div className='flex items-center gap-2' onClick={() => handleOpenSearchModal()}>
                <FiSearch className='hidden xl:block' fontSize={20} cursor={'pointer'} />
                <input
                  className='hidden rounded-2xl border-[1px] border-[#e1e1e1] bg-inherit px-[10px] py-[4px] text-sm outline-none xl:block'
                  type='text'
                  placeholder='Tìm kiếm sản phẩm...'
                />
              </div>
            </div>

            {/* Wishlist, Cart, Account  */}
            <div className='flex items-center gap-2'>
              {/* Wishlist icon */}
              <div className='hidden lg:block' onClick={() => handleOpenSideBar('wishlist')}>
                <CiHeart fontSize={28} cursor={'pointer'} />
              </div>
              {/* Cart icon */}
              <div className='' onClick={() => handleOpenSideBar('cart')}>
                <PiShoppingCartLight fontSize={24} cursor={'pointer'} />
              </div>
              {/* Account icon */}
              <div className='hidden lg:block'>
                <PiUserCircleLight fontSize={26} cursor={'pointer'} />
              </div>
              {/* Menu icon mobile */}
              <div className='lg:hidden' onClick={() => handleOpenSideBar('menu')}>
                <IoMenuOutline fontSize={26} cursor={'pointer'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
