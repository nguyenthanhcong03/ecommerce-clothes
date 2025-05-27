import certificateImage from '@/assets/images/certificate.png';
import { SHOP_ADDRESS, SHOP_EMAIL, SHOP_NAME, SHOP_PHONE } from '@/utils/constants';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

const CUSTOMER_SUPPORT_LINKS = [
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Hướng dẫn chọn size', href: '/huong-dan-chon-size' },
  { label: 'Phương thức thanh toán', href: '/phuong-thuc-thanh-toan' },
  { label: 'Chính sách vận chuyển', href: '/chinh-sach-van-chuyen' },
  { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
  { label: 'Quy định đổi trả', href: '/quy-dinh-doi-tra' },
  { label: 'Chính sách xử lý khiếu nại', href: '/chinh-sach-khieu-nai' }
];

function Footer() {
  return (
    <footer className='w-full border-t-4 border-t-primaryColor bg-gray-50 px-5 text-gray-700'>
      <div className='mx-auto max-w-[1280px] pb-6 pt-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Hỗ trợ khách hàng */}
          <div className='space-y-4'>
            <h3 className='mb-4 border-b-2 border-primaryColor pb-2 text-lg font-bold text-primaryColor'>
              HỖ TRỢ KHÁCH HÀNG
            </h3>
            <div className='space-y-3'>
              {CUSTOMER_SUPPORT_LINKS.map((link, index) => (
                <p key={index} className='cursor-pointer text-sm transition-colors duration-300 hover:underline'>
                  {link.label}
                </p>
              ))}
            </div>
          </div>

          {/* Về chúng tôi */}
          <div className='space-y-4'>
            <h3 className='mb-4 border-b-2 border-primaryColor pb-2 text-lg font-bold text-primaryColor'>
              VỀ CHÚNG TÔI
            </h3>
            <div className='space-y-3 text-sm'>
              <p className='font-semibold text-primaryColor'>Công ty TNHH {SHOP_NAME} Việt Nam</p>
              <div className='flex items-start gap-2'>
                <MapPin className='mt-1 h-4 w-4 flex-shrink-0 text-primaryColor' />
                <p>Số XX Thanh Bình, Mỗ Lao, Hà Đông, Hà Nội</p>
              </div>
              <p>
                <strong>Mã số doanh nghiệp: </strong>
                0123456789 do Sở kế hoạch và đầu tư thành phố Hà Nội cấp ngày 23/09/2025
              </p>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-primaryColor' />
                <a href={`tel:${SHOP_PHONE}`} className='text-primaryColor transition-all duration-300 hover:underline'>
                  {SHOP_PHONE}
                </a>
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-primaryColor' />
                <a
                  href={`mailto:${SHOP_EMAIL}`}
                  className='text-primaryColor transition-all duration-300 hover:underline'
                >
                  {SHOP_EMAIL}
                </a>
              </div>
              <div className='mt-4'>
                <img src={certificateImage} alt='Chứng nhận' className='h-auto max-w-[120px] rounded-lg shadow-sm' />
              </div>
            </div>
          </div>

          {/* Hệ thống cửa hàng */}
          <div className='space-y-4'>
            <h3 className='mb-4 border-b-2 border-primaryColor pb-2 text-lg font-bold text-primaryColor'>
              HỆ THỐNG CỬA HÀNG
            </h3>
            <div className='space-y-3 text-sm'>
              <div className='flex items-start gap-2'>
                <MapPin className='mt-1 h-4 w-4 flex-shrink-0 text-primaryColor' />
                <div>
                  <p className='font-semibold'>Hà Nội:</p>
                  <p className='text-gray-600'>{SHOP_ADDRESS}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kết nối */}
          <div className='space-y-4'>
            <h3 className='mb-4 border-b-2 border-primaryColor pb-2 text-lg font-bold text-primaryColor'>KẾT NỐI</h3>
            <div className='space-y-4'>
              {/* Social Media */}
              <div className='flex gap-3'>
                <a
                  target='_blank'
                  href='https://www.facebook.com/nguyenthanhcong03'
                  className='rounded-full bg-blue-600 p-2 text-white transition-colors duration-300 hover:bg-blue-700'
                >
                  <Facebook className='h-5 w-5' />
                </a>
                <a
                  target='_blank'
                  href='https://www.instagram.com/nguyenthanhcong03/'
                  className='rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-600'
                >
                  <Instagram className='h-5 w-5' />
                </a>
              </div>

              {/* Contact Info */}
              <div className='space-y-3'>
                <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
                  <div className='mb-1 flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primaryColor' />
                    <p className='text-sm font-semibold'>ĐẶT HÀNG (08:30 - 22:00)</p>
                  </div>
                  <a
                    href={`tel:${SHOP_PHONE}`}
                    className='font-bold text-primaryColor transition-all duration-300 hover:underline'
                  >
                    {SHOP_PHONE}
                  </a>
                </div>

                <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
                  <div className='mb-1 flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primaryColor' />
                    <p className='text-sm font-semibold'>GÓP Ý, KHIẾU NẠI (08:30 - 22:00)</p>
                  </div>
                  <a
                    href={`tel:${SHOP_PHONE}`}
                    className='font-bold text-primaryColor transition-all duration-300 hover:underline'
                  >
                    {SHOP_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className='mt-12 border-t border-gray-200 pt-8'>
          <div className='text-center text-gray-600'>
            <p className='text-sm'>© 2025 {SHOP_NAME}</p>
            <p className='mt-2 text-xs'>Thiết kế và phát triển bởi Nguyễn Thành Công</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
