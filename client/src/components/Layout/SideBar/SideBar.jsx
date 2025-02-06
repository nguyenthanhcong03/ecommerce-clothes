import React, { useContext } from 'react';
import { TfiClose } from 'react-icons/tfi';
import { SideBarContext } from '../../../contexts/SideBarProvider';
import SideBarMenu from './ContentSideBar/SideBarMenu';
import SideBarWishlist from './ContentSideBar/SideBarWishlist';
import SideBarCart from './ContentSideBar/SideBarCart';
import SideBarSearch from './ContentSideBar/SideBarSearch';

function SideBar() {
  const { isOpen, setIsOpen, type } = useContext(SideBarContext);
  const handleToggleSideBar = () => {
    setIsOpen(!isOpen);
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
        onClick={handleToggleSideBar}
      ></div>
      {/* )} */}
      {/* SideBar */}
      <div
        className={`fixed -right-full ease-in ${isOpen ? '!right-0' : ''} top-0 z-[51] h-full bg-white transition-all duration-300`}
      >
        {isOpen && (
          <div
            className='absolute left-[-50px] top-[25px] flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-300 ease-in hover:bg-[#ccc]'
            onClick={handleToggleSideBar}
          >
            <TfiClose />
          </div>
        )}

        {handleRenderContentSideBar()}
      </div>
    </div>
  );
}

export default SideBar;
