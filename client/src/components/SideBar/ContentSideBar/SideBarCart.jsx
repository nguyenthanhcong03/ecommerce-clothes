import React from 'react';
import { PiShoppingCartLight } from 'react-icons/pi';
import MenuItem from '../../MenuItem/MenuItem';
import ProductItem from './components/ProductItem';
import Button from '../../Button/Button';

function SideBarCart() {
  return (
    <div className='flex h-full w-[300px] flex-col items-center justify-between gap-4 px-8 py-5 md:w-[400px]'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex flex-col items-center text-lg text-secondaryColor'>
          <PiShoppingCartLight fontSize={24} cursor={'pointer'} />
          <MenuItem text={'GIỎ HÀNG'} href={'/'} />
        </div>
        <div>
          <ProductItem
            name='Product 1'
            price='100'
            src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_1.jpeg'
          />
        </div>
      </div>

      <div className='flex w-full flex-col gap-4'>
        <div className='flex items-center justify-between text-sm text-secondaryColor'>
          <p>SUBTOTAL:</p>
          <p>$199.76</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Button text={'XEM TẤT CẢ'} isPrimary />
          <Button text={'ĐẶT HÀNG'} isPrimary={false} />
        </div>
      </div>
    </div>
  );
}

export default SideBarCart;
