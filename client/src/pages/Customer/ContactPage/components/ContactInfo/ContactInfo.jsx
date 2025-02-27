import React from 'react';
import { FaFacebook, FaInstagramSquare } from 'react-icons/fa';
import { SiShopee, SiZalo } from 'react-icons/si';

function ContactInfo() {
  return (
    <div className='p-5 md:w-5/12 md:border-r-[1px] md:border-[#e1e1e1] md:p-12'>
      <h4 className='text-2xl'>Thông tin liên hệ</h4>
      <hr className='my-[20px]' />
      <div className='flex flex-col gap-5'>
        <div>
          <div className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
              />
            </svg>
            <span>Địa chỉ</span>
          </div>
          <p className='text-secondaryColor'>Số XX Thanh Bình, Phường Mỗ Lao, Quận Hà Đông, TP. Hà Nội</p>
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z'
              />
            </svg>

            <span>Số điện thoại</span>
          </div>
          <p className='text-secondaryColor'>037.370.2309</p>
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'
              />
            </svg>
            <span>Email</span>
          </div>
          <p className='break-words text-secondaryColor'>nguyenthanhcong03@hotmail.com</p>
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
            </svg>

            <span>Giờ mở cửa</span>
          </div>
          <p className='text-secondaryColor'>Mỗi ngày từ 9:00 AM đến 22:00 PM</p>
        </div>
        <div className='flex gap-3'>
          <FaFacebook fontSize={30} />
          <FaInstagramSquare fontSize={30} />
          <SiZalo fontSize={30} />
          <SiShopee fontSize={30} />
        </div>
      </div>
    </div>
  );
}

export default ContactInfo;
