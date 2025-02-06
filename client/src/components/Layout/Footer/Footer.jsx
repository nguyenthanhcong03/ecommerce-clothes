import React from 'react';
import Collapse from '../../Common/Collapse/Collapse';
import certificateImage from '../../../assets/images/certificate.png';
import { FaFacebook } from 'react-icons/fa';
import { FaInstagramSquare } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { SiShopee } from 'react-icons/si';

function Footer() {
  return (
    <div className='w-full bg-[#F1F1F1] p-5 text-primaryColor'>
      <div className='container mx-auto flex max-w-[1280px] flex-col md:grid md:grid-cols-4 md:justify-items-center'>
        <Collapse title={'HỖ TRỢ KHÁCH HÀNG'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2 px-5 pb-3'>
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
          <div className='flex flex-col gap-2 px-5 pb-3'>
            <p>
              <strong>Công ty TNHH Fasalo Việt Nam</strong>
            </p>
            <p>
              <strong>Địa chỉ: </strong>Số XX Thanh Bình, Phường Mỗ Lao, Quận Hà Đông, TP. Hà Nội
            </p>
            <p>
              <strong>Mã số doanh nghiệp: </strong> 0123456789 do Sở kế hoạch và đầu tư thành phố Hà Nội cấp ngày
              23/09/2025
            </p>
            <p>
              <strong>Điện thoại: </strong>0370.372.309
            </p>
            <p>
              <strong>Email: </strong>nguyenthanhcong03@hotmail.com
            </p>
            <div className='p-5'>
              <img src={certificateImage} alt='' />
            </div>
          </div>
        </Collapse>
        <Collapse title={'HỆ THỐNG CỬA HÀNG'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2 px-5 pb-3'>
            <p>
              Hà Nội:
              <br />
              - 175 Tây Sơn, Phường Trung Liệt, Quận Đống Đa
              <br />- 192 Trần Duy Hưng, Phường Trung Hòa, Quận Cầu Giấy
            </p>
            <p>
              TP. Hồ Chí Minh:
              <br />- 297/3 Tô Hiến Thành, Phường 13, Quận 10
            </p>
          </div>
        </Collapse>
        <Collapse title={'KẾT NỐI'} isShow={true} isFooter={true}>
          <div className='flex flex-col gap-2 px-5 pb-4'>
            <div className='flex gap-2'>
              <FaFacebook />
              <FaInstagramSquare />
              <SiZalo />
              <SiShopee />
            </div>
            <p>
              ĐẶT HÀNG (08:30 - 22:00)
              <br />
              <strong>037.037.2309</strong>
            </p>
            <p>
              GÓP Ý, KHIẾU NẠI (08:30 - 22:00)
              <br />
              <strong>0370.372.309</strong>
            </p>
          </div>
        </Collapse>
      </div>
    </div>
  );
}

export default Footer;
