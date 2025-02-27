import React from 'react';
import useTranslateXImage from '@hooks/useTranslateXImage';
import Button from '@components/Button/Button';

function SaleHomePage() {
  const { translateXPosition } = useTranslateXImage();

  return (
    <div className='mb-10 flex items-center justify-center'>
      <div
        className='hidden sm:block'
        style={{ transform: `translateX(${translateXPosition}px)`, transition: 'transform 0.5s ease-in' }}
      >
        <img
          className='h-auto w-full'
          src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_1.jpeg'
          alt=''
        />
      </div>
      <div className='flex flex-col items-center justify-center gap-[30px] text-primaryColor'>
        <h2 className='text-center text-3xl font-normal text-primaryColor'>Sale Of The Year</h2>
        <p className='px-10 text-center text-sm leading-6'>
          Thoải mái và dễ dàng phối đồ. Phong cách nhẹ nhàng nhưng vẫn rất thời trang.
        </p>
        <div>
          <Button variant='secondary'>Xem thêm</Button>
        </div>
      </div>
      <div
        className='hidden sm:block'
        style={{ transform: `translateX(-${translateXPosition}px)`, transition: 'transform 0.5s ease-in' }}
      >
        <img
          className='h-auto w-full'
          src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_2.jpeg'
          alt=''
        />
      </div>
    </div>
  );
}

export default SaleHomePage;
