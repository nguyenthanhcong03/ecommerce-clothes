import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const Unauthorized = () => {
  const location = useLocation();
  const from = location.state?.from || '/';

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 p-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m0 0v2m0-2h2m-2 0H8m11 4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h1 className='mb-4 text-3xl font-bold text-gray-900'>Access Denied</h1>
        <p className='mb-8 text-gray-600'>
          You don't have permission to access this page. Please contact your administrator if you believe this is an
          error.
        </p>
        <div className='flex flex-col space-y-4'>
          <Link
            to={from}
            className='rounded-md bg-gray-200 px-6 py-3 text-center text-gray-800 transition-colors hover:bg-gray-300'
          >
            Go Back
          </Link>
          <Link
            to='/'
            className='rounded-md bg-blue-600 px-6 py-3 text-center text-white transition-colors hover:bg-blue-700'
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

Unauthorized.propTypes = {
  backUrl: PropTypes.string
};

export default Unauthorized;
