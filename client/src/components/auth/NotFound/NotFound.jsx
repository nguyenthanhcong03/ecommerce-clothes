import Button from '@/components/common/Button';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 text-center'>
      <h1 className='mb-4 text-6xl font-bold text-red-500'>404</h1>
      <h2 className='mb-6 text-3xl font-semibold'>Page Not Found</h2>
      <p className='mb-8 text-lg text-gray-600'>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <Link to='/'>
        <Button className='w-full'>Trở về trang chủ</Button>
      </Link>
    </div>
  );
};

export default NotFound;
