import React from 'react';

import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Collapse from '@/components/common/Collapse/Collapse';
import AboutStory from '@/components/ui/about/AboutStory/AboutStory';
import { cardData1, cardData2 } from '@/components/ui/about/AboutStory/constant';
import BrandSwiper from '@/components/ui/about/BrandSwiper/BrandSwiper';
import Headline from '@/components/ui/home/Headline/Headline';

function AboutUsPage() {
  const breadcrumbItems = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Về chúng tôi' } // Không có link, là trang hiện tại
  ];
  return (
    <div className='mx-auto w-full max-w-[1280px] px-10 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb items={breadcrumbItems} />
      </div>
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

export default AboutUsPage;
