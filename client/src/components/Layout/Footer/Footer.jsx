import certificateImage from '@/assets/images/certificate.png';
import Collapse from '@/components/common/Collapse/Collapse';
import { SHOP_ADDRESS, SHOP_EMAIL, SHOP_NAME, SHOP_PHONE } from '@/utils/constants';
import { Facebook, Instagram } from 'lucide-react';
import React from 'react';

const items = [
  { title: 'Mục 1', content: 'Nội dung của mục 1' },
  { title: 'Mục 2', content: 'Nội dung của mục 2' },
  { title: 'Mục 3', content: 'Nội dung của mục 3' }
];

function Footer() {
  return (
    <footer className='w-full border-t-4 border-t-primaryColor bg-[##FBFBFB] p-5 text-primaryColor'>
      <div className='container mx-auto flex max-w-[1280px] flex-col md:grid md:grid-cols-4 md:justify-items-center'>
        <Collapse title={'HỖ TRỢ KHÁCH HÀNG'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2'>
            <p>Hướng dẫn mua hàng</p>
            <p>Hướng dẫn chọn size</p>
            <p>Phương thức thanh toán</p>
            <p>Chính sách vận chuyển</p>
            <p>Chính sách bảo mật</p>
            <p>Quy định đổi trả</p>
            <p>Chính sách xử lý khiếu nại</p>
          </div>
        </Collapse>
        <Collapse title={'VỀ CHÚNG TÔI'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2'>
            <p>
              <strong>Công ty TNHH {SHOP_NAME} Việt Nam</strong>
            </p>
            <p>
              <strong>Địa chỉ: </strong>Số XX Thanh Bình,Mỗ Lao, Hà Đông, Hà Nội
            </p>
            <p>
              <strong>Mã số doanh nghiệp: </strong> 0123456789 do Sở kế hoạch và đầu tư thành phố Hà Nội cấp ngày
              23/09/2025
            </p>
            <p>
              <strong>SĐT: </strong>
              <a href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE}</a>
            </p>
            <p>
              <strong>Email: </strong>
              <a href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a>
            </p>
            <div className='p-5'>
              <img src={certificateImage} alt='' />
            </div>
          </div>
        </Collapse>
        <Collapse title={'HỆ THỐNG CỬA HÀNG'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2'>
            <p>
              Hà Nội:
              <br />- {SHOP_ADDRESS}
            </p>
          </div>
        </Collapse>
        <Collapse title={'KẾT NỐI'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <a target='_blank' href='https://www.facebook.com/nguyenthanhcong03'>
                <Facebook />
              </a>
              <a target='_blank' href='https://www.instagram.com/nguyenthanhcong03/'>
                <Instagram />
              </a>
            </div>
            <p>
              ĐẶT HÀNG (08:30 - 22:00)
              <br />
              <a href={`tel:${SHOP_PHONE}`}>
                <strong>{SHOP_PHONE}</strong>
              </a>
            </p>
            <p>
              GÓP Ý, KHIẾU NẠI (08:30 - 22:00)
              <br />
              <a href={`tel:${SHOP_PHONE}`}>
                <strong>{SHOP_PHONE}</strong>
              </a>
            </p>
          </div>
        </Collapse>
      </div>
    </footer>
  );
}

export default Footer;
