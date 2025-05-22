import CartItem from '@/components/cart/CartItem/CartItem';
import Button from '@/components/common/Button/Button';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import { getCart } from '@/store/slices/cartSlice';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { ShoppingCart } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function SideBarCart() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  return (
    <div className='flex h-full w-[300px] flex-col items-center justify-between gap-4 px-8 py-5 md:w-[400px]'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex flex-col items-center text-lg text-secondaryColor'>
          <ShoppingCart fontSize={24} cursor={'pointer'} />
          <MenuItem
            text={'GIỎ HÀNG'}
            href={'/cart'}
            onClick={() => {
              dispatch(toggleSidebar());
            }}
          />
        </div>
        <div>
          {items?.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              onSelect={handleSelectItem}
              isSelected={selectedItems.includes(item._id)}
            />
          ))}
        </div>
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
              navigate('/cart');
            }}
          >
            XEM TẤT CẢ
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              dispatch(toggleSidebar());
              navigate('/checkout');
            }}
          >
            ĐẶT HÀNG
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SideBarCart;
