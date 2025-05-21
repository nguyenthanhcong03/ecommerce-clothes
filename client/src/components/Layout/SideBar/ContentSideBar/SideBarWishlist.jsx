import CartItem from '@/components/cart/CartItem/CartItem';
import Button from '@/components/common/Button/Button';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SideBarWishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className='flex h-full w-[300px] flex-col items-center justify-between gap-4 px-8 py-5 md:w-[400px]'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex flex-col items-center text-lg text-secondaryColor'>
          <Heart fontSize={28} cursor={'pointer'} />
          <MenuItem text={'YÊU THÍCH'} href={'/wishlist'} />
        </div>
        <div>
          <CartItem
            name='Product 1'
            price='100'
            src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_1.jpeg'
          />
        </div>
      </div>

      <div className='flex w-full flex-col gap-2'>
        <Button
          onClick={() => {
            dispatch(toggleSidebar());
            navigate('/wishlist');
          }}
        >
          XEM TẤT CẢ
        </Button>
        <Button
          variant='secondary'
          onClick={() => {
            dispatch(toggleSidebar());
          }}
        >
          THÊM TẤT CẢ VÀO GIỎ HÀNG
        </Button>
      </div>
    </div>
  );
}

export default SideBarWishlist;
