import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Collapse from '@/components/common/Collapse/Collapse';
import Headline from '@/components/common/Headline/Headline';
import AboutStory from '@/pages/customer/AboutPage/components/AboutStory/AboutStory';
import { cardData1, cardData2 } from '@/pages/customer/AboutPage/components/AboutStory/constant';
import BrandSwiper from '@/pages/customer/AboutPage/components/BrandSwiper/BrandSwiper';
import React from 'react';

function AboutPage() {
  return (
    <div className='px-5 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb
          items={[
            {
              label: 'Về chúng tôi',
              path: '/about'
            }
          ]}
        />
      </div>
      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1={'Tận tâm vì phong cách của bạn'} text2={'CHÀO MỪNG ĐẾN VỚI OUTFITORY'} />
      </div>
      <div className='rounded-md bg-white p-8'>
        <div>
          <AboutStory {...cardData1} />
        </div>
        <div>
          <AboutStory {...cardData2} />
        </div>
      </div>

      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1={'Chúng tôi luôn sẵn sàng hỗ trợ bạn'} text2={'Bạn có thắc mắc gì không?'} />
        <div className='mx-auto my-8 max-w-[700px]'>
          <Collapse title={'1. Làm thế nào để tôi đặt hàng trên website?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Bạn chỉ cần chọn sản phẩm yêu thích, chọn kích cỡ và màu sắc, sau đó nhấn “Thêm vào giỏ hàng” và làm
                theo hướng dẫn thanh toán.
              </p>
            </div>
          </Collapse>
          <Collapse title={'2. Tôi có cần tạo tài khoản để mua hàng không?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Không bắt buộc. Bạn có thể đặt hàng với tư cách khách. Tuy nhiên, tạo tài khoản giúp bạn theo dõi đơn
                hàng, lưu địa chỉ và nhận ưu đãi riêng.
              </p>
            </div>
          </Collapse>
          <Collapse title={'3. Tôi có thể đổi hoặc trả hàng không?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Có. Bạn có thể đổi hoặc trả hàng trong vòng 7 ngày kể từ khi nhận được hàng nếu sản phẩm chưa qua sử
                dụng và còn nguyên tem, tag.
              </p>
            </div>
          </Collapse>
          <Collapse title={'4. Bao lâu tôi nhận được hàng sau khi đặt?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Thời gian giao hàng thường từ 2–5 ngày làm việc tùy khu vực. Bạn sẽ nhận được mã vận đơn để theo dõi đơn
                hàng sau khi chúng tôi gửi đi.
              </p>
            </div>
          </Collapse>
          <Collapse title={'7. Phương thức thanh toán nào được chấp nhận?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và thanh toán qua ví điện tử
                như Momo, ZaloPay.
              </p>
            </div>
          </Collapse>
          <Collapse title={'8. Làm sao để tôi kiểm tra tình trạng đơn hàng?'}>
            <div className='flex flex-col gap-2 text-sm'>
              <p>
                Bạn có thể vào mục “Theo dõi đơn hàng” và nhập mã đơn hàng để xem trạng thái. Hoặc đăng nhập tài khoản
                để theo dõi tất cả đơn đã đặt.
              </p>
            </div>
          </Collapse>
        </div>
      </div>
      <div className='my-8'>
        <BrandSwiper />
      </div>
    </div>
  );
}

export default AboutPage;
