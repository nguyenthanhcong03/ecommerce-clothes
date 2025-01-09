import React from 'react';
import useTranslateXImage from '../../hooks/useTranslateXImage';

function SaleHomePage() {
  const { translateXPosition } = useTranslateXImage();

  return (
    <div className='mt-[150px] flex items-center justify-center'>
      <div className='' style={{ transform: `translateX(${translateXPosition}px)`, transition: 'transform 0.5s ease' }}>
        <img
          className='h-auto w-full'
          src='https://xstore.8theme.com/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image_1.jpeg'
          alt=''
        />
      </div>
      <div className='m-[50px] flex flex-col items-center justify-center gap-[30px]'>
        <h2 className='m-0 text-center text-4xl font-normal text-primaryColor'>Sale Of The Year</h2>
        <p className='w-[460px] text-center text-base leading-6'>
          Thoải mái và dễ dàng phối đồ. Phong cách nhẹ nhàng nhưng vẫn rất thời trang.
        </p>
      </div>
      <div
        className=''
        style={{ transform: `translateX(-${translateXPosition}px)`, transition: 'transform 0.5s ease' }}
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
