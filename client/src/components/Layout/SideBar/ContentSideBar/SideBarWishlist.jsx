import CartItem from '@/components/cart/CartItem/CartItem';
import Button from '@/components/common/Button/Button';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import { getCart } from '@/store/slices/cartSlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { is } from 'date-fns/locale';
import { ShoppingCart } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function SideBarWishlist() {
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.account);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleAddAllToCart = () => {
    // // Lưu các sản phẩm đã chọn vào localStorage
    // localStorage.setItem('orderItems', JSON.stringify(items));

    // // Đặt các sản phẩm đã chọn vào trạng thái đơn hàng
    // dispatch(setOrderItems(items));

    navigate('/cart');
  };

  return (
    <div className='flex h-full w-[300px] flex-col items-center gap-4 px-8 py-5 md:w-[400px]'>
      <div className='flex flex-col items-center text-lg text-secondaryColor'>
        <ShoppingCart fontSize={24} cursor={'pointer'} />
        <MenuItem
          text={'YÊU THÍCH'}
          href={'/wishlist'}
          onClick={() => {
            dispatch(toggleSidebar());
          }}
        />
      </div>
      {isAuthenticated ? (
        items && items.length > 0 ? (
          <div className='flex w-full flex-1 flex-col justify-between gap-4'>
            <div>
              {items?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
            <div className='flex w-full flex-col gap-4'>
              <div className='flex items-center justify-between text-sm text-secondaryColor'>
                <p>SUBTOTAL:</p>
                <p>$199.76</p>
              </div>
              <div className='flex flex-col gap-2'>
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
                    handleAddAllToCart();
                  }}
                >
                  THÊM TẤT CẢ VÀO GIỎ HÀNG
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex w-full flex-1 items-center justify-center'>
            <div className='text-center'>Danh sách sản phẩm yêu thích trống.</div>
          </div>
        )
      ) : (
        <div className='flex w-full flex-1 flex-col items-center justify-center gap-4'>
          <div className='flex w-full flex-col gap-8'>
            <div className='text-center'>Hãy đăng nhập để xem sản phẩm yêu thích của bạn.</div>

            <div className='flex flex-col gap-2'>
              <Button
                onClick={() => {
                  dispatch(toggleSidebar());
                  navigate('/login');
                }}
              >
                ĐĂNG NHẬP
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  dispatch(toggleSidebar());
                  navigate('/register');
                }}
              >
                ĐĂNG KÝ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBarWishlist;
