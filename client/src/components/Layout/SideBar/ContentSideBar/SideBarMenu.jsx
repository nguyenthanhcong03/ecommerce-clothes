import Logo from '@/assets/images/outfitory-logo.png';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import { CircleUserRound, Heart, ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';

function SideBarMenu() {
  const { isAuthenticated, user } = useSelector((state) => state.account);
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const handleToggleSideBar = () => {
    // setIsOpen(!isOpen);
  };

  return (
    <div className='flex h-full w-[300px] flex-col gap-6 px-8 py-5'>
      <div className='mx-auto'>
        <img src={Logo} alt='' className='h-[50px] w-[150px]' />
      </div>
      <div className='flex flex-col gap-4'>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'TRANG CHỦ'} href={'/'} onClick={handleToggleSideBar} />
        </div>
        <div className='w-fit text-sm text-secondaryColor'>
          <MenuItem text={'SẢN PHẨM'} href={'/shop'} onClick={handleToggleSideBar} />
        </div>
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
      {isAdmin ? (
        <></>
      ) : (
        <div className='flex cursor-pointer flex-col gap-4 text-sm text-secondaryColor'>
          <div className='flex items-center gap-2'>
            <CircleUserRound fontSize={26} />
            <p>Tài khoản</p>
          </div>
          <div className='flex items-center gap-2'>
            <ShoppingCart fontSize={26} />
            <p>Giỏ hàng</p>
          </div>
          <div className='flex items-center gap-2'>
            <Heart fontSize={26} />
            <p>Yêu thích</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBarMenu;
