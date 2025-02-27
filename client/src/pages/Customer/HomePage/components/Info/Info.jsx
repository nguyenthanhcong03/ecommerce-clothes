import React from 'react';
import InfoCard from './InfoCard';
import truckIcon from '../../../../../assets/icons/truckIcon.svg';
import debitCardIcon from '../../../../..//assets/icons/debitCardIcon.svg';
import boxIcon from '../../../../..//assets/icons/boxIcon.svg';
import chatIcon from '../../../../..//assets/icons/chatIcon.svg';

function Info() {
  return (
    <div className='w-full'>
      <div className='container relative mx-auto mt-[-90px] grid max-w-[1280px] items-center justify-items-center bg-primaryColor py-5 md:grid-cols-2 xl:grid-cols-4'>
        <InfoCard title={'Miễn phí vận chuyển'} description={'Đơn hàng từ 100.000đ'} src={truckIcon} />
        <InfoCard title={'Thanh toán 100% an toàn'} description={'Trả góp trong 9 tháng'} src={debitCardIcon} />
        <InfoCard title={'Hoàn trả trong 14 ngày'} description={'Mua sắm an tâm'} src={boxIcon} />
        <InfoCard title={'Hỗ trợ trực tuyến 24/7'} description={'Giao hàng tận nhà'} src={chatIcon} />
      </div>
    </div>
  );
}

export default Info;
