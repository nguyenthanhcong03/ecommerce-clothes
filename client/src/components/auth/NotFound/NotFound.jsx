import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 text-center'>
      <h1 className='mb-4 text-6xl font-bold text-red-500'>404</h1>
      <h2 className='mb-6 text-3xl font-semibold'>Page Not Found</h2>
      <p className='mb-8 text-lg text-gray-600'>The page you are looking for doesn't exist or has been moved.</p>
      <Link to='/' className='rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700'>
        Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
