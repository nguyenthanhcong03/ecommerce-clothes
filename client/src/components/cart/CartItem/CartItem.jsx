import React from 'react';
import { X } from 'lucide-react';

function CartItem({ item }) {
  console.log('item', item);
  return (
    <div className='group relative flex items-start justify-between gap-5 overflow-hidden px-5 py-3 transition-colors duration-200 ease-in hover:bg-[#f7f7f7]'>
      <img src={item?.image} alt='' className='h-auto w-[70px] cursor-pointer' />
      <div className='flex flex-1 flex-col items-start justify-center gap-1'>
        <div className='cursor-pointer text-base text-primaryColor'>{item?.productId.name}</div>
        <div className='text-sm text-secondaryColor'>Size: {item?.size}</div>
        <div className='text-sm text-secondaryColor'>{item?.price} Đ</div>
      </div>
      <div>
        <X className='absolute right-2 top-2 translate-x-6 cursor-pointer text-sm text-secondaryColor opacity-0 transition-all duration-200 ease-in hover:text-primaryColor group-hover:-translate-x-0 group-hover:opacity-100' />
      </div>
    </div>
  );
}

export default CartItem;
