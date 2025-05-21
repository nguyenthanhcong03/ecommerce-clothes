import Collapse from '@/components/common/Collapse/Collapse';
import Headline from '@/components/common/Headline/Headline';
import AboutStory from '@/pages/customer/AboutPage/components/AboutStory/AboutStory';
import { cardData1, cardData2 } from '@/pages/customer/AboutPage/components/AboutStory/constant';
import BrandSwiper from '@/pages/customer/AboutPage/components/BrandSwiper/BrandSwiper';
import React from 'react';

function AboutPage() {
  return (
    <div className='mx-auto w-full max-w-[1280px] px-10 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'></div>
      <div className='my-8'>
        <Headline text1={'Tận tâm vì phong cách của bạn'} text2={'CHÀO MỪNG ĐẾN VỚI FASALO'} />
      </div>
      <div>
        <div>
          <AboutStory {...cardData1} />
        </div>
        <div>
          <AboutStory {...cardData2} />
        </div>
      </div>
      <div className='my-8'>
        <BrandSwiper />
      </div>
      <div className='my-8'>
        <Headline text1={'Chúng tôi luôn sẵn sàng hỗ trợ bạn'} text2={'Bạn có thắc mắc gì không?'} />
        <div className='mx-auto my-8 max-w-[860px]'>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
          <Collapse title={'Feugiat purus mi nisl dolor pellentesque tellus?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores commodi tempore molestiae nemo nam hic
                voluptatem totam adipisci. Incidunt animi inventore eum officiis in laudantium commodi sit fuga, sunt
                ipsa?
              </p>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
