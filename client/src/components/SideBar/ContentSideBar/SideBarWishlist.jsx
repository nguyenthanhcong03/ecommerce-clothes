import React from 'react';
import { CiHeart } from 'react-icons/ci';
import MenuItem from '../../MenuItem/MenuItem';
import ProductItem from './components/ProductItem';
import Button from '../../Button/Button';

function SideBarWishlist() {
  return (
    <div className='md:w-[400px] flex h-full w-[300px] flex-col items-center justify-between gap-4 px-8 py-5'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex flex-col items-center text-lg text-secondaryColor'>
          <CiHeart fontSize={28} cursor={'pointer'} />
          <MenuItem text={'YÊU THÍCH'} href={'/'} />
        </div>
        <div>
          <ProductItem
            name='Product 1'
            price='100'
            src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_1.jpeg'
          />
        </div>
      </div>

      <div className='flex w-full flex-col gap-2'>
        <Button text={'XEM TẤT CẢ'} isPrimary />
        <Button text={'THÊM TẤT CẢ VÀO GIỎ HÀNG'} isPrimary={false} />
      </div>
    </div>
  );
}

export default SideBarWishlist;
