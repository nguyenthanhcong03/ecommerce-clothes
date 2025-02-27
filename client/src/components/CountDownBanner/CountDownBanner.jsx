import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button/Button';
import CountdownTimer from './CountDownTimer';

function CountDownBanner({ backgroundImage }) {
  const targetDate = '2025-12-31T00:00:00';
  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center gap-5 rounded border-2 bg-cover bg-center bg-no-repeat p-5'
      style={{
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <div className='flex items-center justify-center gap-[10px]'>
        <CountdownTimer targetDate={targetDate} />
      </div>
      <p className='text-center text-[28px] text-primaryColor'>Phong cách cổ điển đang quay trở lại</p>
      <Link to={'/shop'}>
        <Button size={'medium'}>Mua ngay</Button>
      </Link>
    </div>
  );
}

export default CountDownBanner;
