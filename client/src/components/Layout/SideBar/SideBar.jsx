import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import SideBarCart from './ContentSideBar/SideBarCart';
import SideBarMenu from './ContentSideBar/SideBarMenu';
import SideBarSearch from './ContentSideBar/SideBarSearch';

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
      <div
        className={`fixed inset-0 z-40 bg-black ${isOpen ? '!visible !bg-opacity-50' : 'invisible bg-opacity-0'} transition-all duration-300 ease-in`}
        onClick={handleToggleSidebar}
      ></div>
      {/* SideBar Left (Menu & Search) */}
      <div
        className={`fixed top-0 z-[51] h-full bg-white transition-all duration-300 ease-in-out ${
          type === 'menu' && isOpen ? 'left-0' : '-left-full'
        }`}
      >
        {isOpen && type === 'menu' && (
          <div
            className='absolute left-[-50px] top-[25px] flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-300 ease-in hover:bg-[#ccc]'
            onClick={handleToggleSidebar}
          >
            <X />
          </div>
        )}

        {type === 'menu' && handleRenderContentSideBar()}
      </div>

      {/* SideBar Right (Cart) */}
      <div
        className={`fixed top-0 z-[51] h-full bg-white transition-all duration-300 ease-in-out ${
          (type === 'cart' || type === 'search') && isOpen ? 'right-0' : '-right-full'
        }`}
      >
        {isOpen && (type === 'cart' || type === 'search') && (
          <div
            className='absolute right-[-50px] top-[25px] flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-300 ease-in hover:bg-[#ccc]'
            onClick={handleToggleSidebar}
          >
            <X />
          </div>
        )}

        {(type === 'cart' || type === 'search') && handleRenderContentSideBar()}
      </div>
    </div>
  );
}

export default SideBar;
