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

function Header() {
  // const [isShow, setIsShow] = useState(false);
  const { isOpen, setIsOpen, type, setType } = useContext(SideBarContext);

  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);

  const handleOpenSideBar = (type) => {
    setIsOpen(true);
    setType(type);
  };

  useEffect(() => {
    setFixedPosition(scrollPosition > 80 ? true : false);
  }, [scrollPosition]);
  return (
    <div
      className={`absolute left-0 right-0 top-0 h-[60px] w-full bg-transparent lg:h-[80px] min-[1537px]:bg-[#FFFFFFE6] min-[1537px]:shadow-shadowHeader ${
        fixedPosition
          ? '!fixed top-[-60px] z-10 translate-y-[60px] !bg-[#FFFFFFE6] shadow-shadowHeader backdrop-blur-sm transition-transform duration-500 ease-in lg:top-[-80px] lg:translate-y-[80px]'
          : ''
      }`}
    >
      <div className='container mx-auto flex h-full max-w-[1280px] items-center justify-between gap-10 px-4'>
        <div>
          <img src={Logo} alt='' className='h-[50px] w-[150px]' onClick={() => handleOpenSideBar('menu')} />
        </div>
        <div className='hidden lg:flex lg:gap-10'>
          <div className='w-fit text-base text-primaryColor'>
            <MenuItem text={'TRANG CHỦ'} href={'/'} />
          </div>
          <div className='w-fit text-base text-primaryColor'>
            <MenuItem text={'SẢN PHẨM'} href={'/'} />
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
        <div className='flex gap-4'>
          <div className='flex items-center gap-2' onClick={() => handleOpenSideBar('search')}>
            <FiSearch fontSize={20} cursor={'pointer'} />
            <input
              className='hidden rounded-2xl border-[1px] border-[#e1e1e1] bg-inherit p-[4px] px-[10px] pt-[4px] text-sm outline-none xl:block'
              type='text'
              placeholder='Tìm kiếm sản phẩm...'
            />
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden lg:block' onClick={() => handleOpenSideBar('wishlist')}>
              <CiHeart fontSize={28} cursor={'pointer'} />
            </div>
            <div className='' onClick={() => handleOpenSideBar('cart')}>
              <PiShoppingCartLight fontSize={24} cursor={'pointer'} />
            </div>
            <div className='hidden lg:block'>
              <PiUserCircleLight fontSize={26} cursor={'pointer'} />
            </div>
            <div className='lg:hidden' onClick={() => handleOpenSideBar('menu')}>
              <IoMenuOutline fontSize={26} cursor={'pointer'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
