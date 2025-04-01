import React, { memo } from 'react';
import { HashLoader } from 'react-spinners';

const Loading = () => {
  return <HashLoader color='#36d7b7' size={100} />;
};

export default memo(Loading);
