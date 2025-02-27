import Logo from '@assets/images/logocopy.png';
import CollapseMenuSidebar from '@components/CollapseMenuSidebar/CollapseMenuSidebar';
import MenuItem from '@components/MenuItem/MenuItem';
// import { useContext } from 'react';
import { CiHeart } from 'react-icons/ci';
import { PiShoppingCartLight, PiUserCircleLight } from 'react-icons/pi';

function SideBarMenu() {
  // const { isOpen, setIsOpen, type } = useContext(SideBarContext);
  const handleToggleSideBar = () => {
    // setIsOpen(!isOpen);
  };

  return (
    <div className='flex h-full w-[300px] flex-col gap-6 px-8 py-5'>
      <div className='mx-auto'>
        <img src={Logo} alt='' className='h-[50px] w-[150px]' />
      </div>
      {/* <div className='flex justify-center items-center mx-auto gap-2 w-full border-[#e1e1e1] border-[1px]'>
        <input
          className='flex-1 py-[4px] h-[35px] outline-none text-sm px-[10px]'
          type='text'
          placeholder='Tìm kiếm sản phẩm...'
        />
        <FiSearch fontSize={18} cursor={'pointer'} className='mr-2' />
      </div> */}
      <div className='flex flex-col gap-4'>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'TRANG CHỦ'} href={'/'} onClick={handleToggleSideBar} />
        </div>
        {/* <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'SẢN PHẨM'} href={'/'} />
        </div> */}
        <CollapseMenuSidebar title={'SẢN PHẨM'}>
          <div className='mt-2 flex flex-col gap-2 px-2'>
            <p>Tất cả sản phẩm</p>
            <p>Áo thun</p>
            <p>Quần jeans</p>
          </div>
        </CollapseMenuSidebar>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'VỀ CHÚNG TÔI'} href={'/about'} onClick={handleToggleSideBar} />
        </div>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'TIN TỨC'} href={'/news'} onClick={handleToggleSideBar} />
        </div>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'LIÊN HỆ'} href={'/contact'} onClick={handleToggleSideBar} />
        </div>
      </div>
      <div className='flex cursor-pointer flex-col gap-4 text-sm text-secondaryColor'>
        <div className='flex items-center gap-2'>
          <PiUserCircleLight fontSize={26} />
          <p>Tài khoản</p>
        </div>
        <div className='flex items-center gap-2'>
          <PiShoppingCartLight fontSize={26} />
          <p>Giỏ hàng</p>
        </div>
        <div className='flex items-center gap-2'>
          <CiHeart fontSize={26} />
          <p>Yêu thích</p>
        </div>
      </div>
    </div>
  );
}

export default SideBarMenu;
