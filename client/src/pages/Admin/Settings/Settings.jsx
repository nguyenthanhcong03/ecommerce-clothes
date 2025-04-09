import React from 'react';

// components

import CardSettings from '@components/AdminComponents/Cards/CardSettings.jsx';
import CardProfile from '@components/AdminComponents/Cards/CardProfile.jsx';

export default function Settings() {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full px-4 lg:w-8/12'>
          <CardSettings />
        </div>
        <div className='w-full px-4 lg:w-4/12'>
          <CardProfile />
        </div>
      </div>
    </>
  );
}
