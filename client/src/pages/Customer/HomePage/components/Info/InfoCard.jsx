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

export default InfoCard;
