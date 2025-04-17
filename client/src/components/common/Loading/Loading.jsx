import React, { memo } from 'react';
import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className='flex items-center justify-center'>
      <HashLoader color='#36d7b7' size={50} />
    </div>
  );
};

export default memo(Loading);
