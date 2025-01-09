import React from 'react';
import Button from '../Button/Button';
import { CiHeart } from 'react-icons/ci';
import { BsCartPlus } from 'react-icons/bs';
import { CiZoomIn } from 'react-icons/ci';

function ProductItem({ src, previewSrc, name, price }) {
  //   const { isShowGrid } = useContext(OurShopContext);

  return (
    // <div className={isShowGrid ? '' : itemContainer}>
    <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden rounded border-2'>
      <div className='group relative h-auto w-full cursor-pointer'>
        <img className='h-auto w-full object-cover' src={src} alt='' />
        <img
          className='absolute bottom-0 left-0 right-0 top-0 h-auto w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
          src={previewSrc}
          alt=''
        />

        <div className='absolute right-3 top-3 flex flex-col gap-2 bg-transparent transition-all duration-300 group-hover:right-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 lg:right-0 lg:opacity-0'>
          <div className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-base hover:bg-[#D9D9D9] sm:h-[40px] sm:w-[40px] sm:text-xl'>
            <CiHeart />
          </div>
          <div className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-base hover:bg-[#D9D9D9] sm:h-[40px] sm:w-[40px] sm:text-2xl'>
            <CiZoomIn />
          </div>
        </div>
      </div>
      <div className='flex h-full w-full flex-col items-start justify-between gap-[10px] p-3 sm:p-5'>
        <div>
          {/* {!isHomePage && (
          <div className={boxSize}>
            {details.size.map((item, index) => {
              return (
                <div key={index} className={sizeName}>
                  {item.name}
                </div>
              );
            })}
          </div>
        )} */}
          <div className='cursor-pointer text-xs text-primaryColor sm:text-base'>{name}</div>
        </div>
        <div className='w-full'>
          <div className='my-1 text-[10px] font-normal text-secondaryColor sm:my-2 sm:text-sm'>${price}</div>
          <div className='flex w-full items-center justify-between gap-2'>
            <Button text={'MUA NGAY'} />
            <div className='flex h-[24px] w-[34px] cursor-pointer items-center justify-center rounded border-[1px] border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-white sm:h-[40px] sm:w-[50px]'>
              <BsCartPlus className='text-xs sm:text-lg' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
