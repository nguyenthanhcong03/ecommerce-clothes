import React from 'react';

function Textarea({ placeholder, rows = 4, cols = 50 }) {
  return (
    <textarea
      className='w-full flex-1 resize-none border border-gray-300 p-3 px-[10px] text-sm outline-none focus-within:border-primaryColor'
      placeholder={placeholder}
      rows={rows}
      cols={cols}
    />
  );
}

export default Textarea;
