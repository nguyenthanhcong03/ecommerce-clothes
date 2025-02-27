import React, { useEffect } from 'react';
import { PiShoppingCartLight } from 'react-icons/pi';
import MenuItem from '@components/MenuItem/MenuItem';
import CartItem from '@components/CartItem/CartItem';
import Button from '@components/Button/Button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartByUser } from '@redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

function SideBarCart() {
  const carts = useSelector((state) => state.cart.carts);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCartByUser());
    console.log(carts);
  }, []);
  return (
    <div className='flex h-full w-[300px] flex-col items-center justify-between gap-4 px-8 py-5 md:w-[400px]'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex flex-col items-center text-lg text-secondaryColor'>
          <PiShoppingCartLight fontSize={24} cursor={'pointer'} />
          <MenuItem text={'GIỎ HÀNG'} href={'/cart'} />
        </div>
        <div>
          {carts?.map((item) => (
            <CartItem
              key={item.products.id}
              name={item.products.title}
              price={item.products.price}
              src={item.products.thumbnail}
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
          <Link to={'/cart'}>
            <Button fullWidth>XEM TẤT CẢ</Button>
          </Link>
          <Button variant='secondary'>ĐẶT HÀNG</Button>
        </div>
      </div>
    </div>
  );
}

export default SideBarCart;
