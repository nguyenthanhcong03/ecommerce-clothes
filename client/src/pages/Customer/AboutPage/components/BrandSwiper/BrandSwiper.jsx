import coolmate from '@/assets/images/coolmate.png';
import owen from '@/assets/images/owen.svg';
import routine from '@/assets/images/routine.png';
import yody from '@/assets/images/yody.svg';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import './BrandSwiper.css';

function BrandSwiper() {
  return (
    <div className='swiper-container drop-shadow-xl'>
      <Swiper modules={[Navigation]} spaceBetween={10} slidesPerView={4} navigation loop={true} className='mySwiper'>
        <SwiperSlide className='custom-slide'>
          <img src={owen} alt='Owen' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={coolmate} width={90} alt='Coolmate' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={routine} width={200} alt='Routine' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={yody} alt='Yody' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={owen} alt='Owen' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={coolmate} width={90} alt='Coolmate' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={routine} width={200} alt='Routine' />
        </SwiperSlide>
        <SwiperSlide className='custom-slide'>
          <img src={yody} alt='Yody' />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default BrandSwiper;
