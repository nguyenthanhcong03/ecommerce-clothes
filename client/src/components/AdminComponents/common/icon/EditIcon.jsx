import React from 'react';
import propTypes from 'prop-types';
import { Pencil } from 'lucide-react';

const EditIcon = ({ onClick }) => {
  return (
    <button className='rounded-[5px] bg-[#0961FF] p-1 transition-colors hover:bg-blue-700' onClick={onClick}>
      <Pencil strokeWidth={1.5} width={16} height={16} color='#fff' />
    </button>
  );
};

EditIcon.propTypes = {
  onClick: propTypes.func.isRequired
};

export default EditIcon;
