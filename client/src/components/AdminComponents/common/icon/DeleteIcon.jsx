import { Trash2 } from 'lucide-react';
import React from 'react';
import PropTypes from 'prop-types';

const DeleteIcon = ({ onClick }) => {
  return (
    <button onClick={onClick} className='rounded-[5px] bg-[#DE2E3D] p-1 transition-colors hover:bg-red-700'>
      <Trash2 strokeWidth={1.5} width={16} height={16} color='#fff' />
    </button>
  );
};

DeleteIcon.propTypes = {
  onClick: PropTypes.func
};

export default DeleteIcon;
