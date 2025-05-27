import boxIcon from '@//assets/icons/boxIcon.svg';
import chatIcon from '@//assets/icons/chatIcon.svg';
import debitCardIcon from '@//assets/icons/debitCardIcon.svg';
import truckIcon from '@/assets/icons/truckIcon.svg';
import { POLICIES } from '@/utils/constants';
import React from 'react';

function InfoCard({ title, description, src }) {
  return (
    <div className='flex w-[280px] items-center justify-start gap-5 p-[15px]'>
      <img width={30} height={30} src={src} alt='' />
      <div className='flex flex-col items-start justify-center gap-[10px] text-white'>
        <div className='text-[17px]'>{title}</div>
        <div className='text-[16px] text-[#D2D2D2]'>{description}</div>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className='mt-[-80px] grid items-center justify-items-center bg-primaryColor py-5 md:grid-cols-2 xl:grid-cols-4'>
      {POLICIES.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className='flex w-[280px] items-center justify-start gap-5 p-4'>
            <Icon strokeWidth={1} className='h-10 w-10 text-[#707070]' />
            <div className='items- flex flex-col justify-center'>
              <p className='text-lg font-medium text-white'>{item.title}</p>
              {item.subtitle && <p className='text-base text-[#D2D2D2]'>{item.subtitle}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Info;
