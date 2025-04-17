import brandLogo01 from '@/assets/images/brand-01-min.png';
import brandLogo02 from '@/assets/images/brand-02-min.png';
import brandLogo03 from '@/assets/images/brand-03-min.png';
import brandLogo04 from '@/assets/images/brand-04-min.png';
import brandLogo05 from '@/assets/images/brand-05-min.png';
import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import './BrandSwiper.css';

function BrandSwiper() {
  return (
    <div className='swiper-container'>
      <Swiper modules={[Navigation]} spaceBetween={10} slidesPerView={5} navigation loop={true} className='mySwiper'>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo01} alt='Nike' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo02} alt='Adidas' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo03} alt='Puma' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo04} alt='Gucci' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo05} alt='Louis Vuitton' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo01} alt='Nike' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo02} alt='Adidas' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo03} alt='Puma' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo04} alt='Gucci' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={brandLogo05} alt='Louis Vuitton' />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default BrandSwiper;
