import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { X } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SideBarCart from './ContentSideBar/SideBarCart';
import SideBarMenu from './ContentSideBar/SideBarMenu';
import SideBarSearch from './ContentSideBar/SideBarSearch';
import SideBarWishlist from './ContentSideBar/SideBarWishlist';

function SideBar() {
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const type = useSelector((state) => state.sidebar.type);
  const dispatch = useDispatch();

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleRenderContentSideBar = () => {
    switch (type) {
      case 'menu':
        return <SideBarMenu />;
      case 'wishlist':
        return <SideBarWishlist />;
      case 'cart':
        return <SideBarCart />;
      case 'search':
        return <SideBarSearch />;
      default:
        return <SideBarMenu />;
    }
  };

  return (
    <div className='relative'>
      {/* Overlay */}
      {/* {isOpen && ( */}
      <div
        className={`fixed inset-0 z-40 bg-black ${isOpen ? '!visible !bg-opacity-50' : 'invisible bg-opacity-0'} transition-all duration-300 ease-in`}
        onClick={handleToggleSidebar}
      ></div>
      {/* )} */}
      {/* SideBar */}
      <div
        className={`fixed -right-full ease-in ${isOpen ? '!right-0' : ''} top-0 z-[51] h-full bg-white transition-all duration-300`}
      >
        {isOpen && (
          <div
            className='absolute left-[-50px] top-[25px] flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-300 ease-in hover:bg-[#ccc]'
            onClick={handleToggleSidebar}
          >
            <X />
          </div>
        )}

        {handleRenderContentSideBar()}
      </div>
    </div>
  );
}

export default SideBar;
