import React from 'react';

function Textarea({ placeholder, rows = 4, cols = 50 }) {
  return (
    <textarea
      className='w-full flex-1 resize-none border-[1px] border-[#e1e1e1] p-3 px-[10px] text-sm outline-none'
      placeholder={placeholder}
      rows={rows}
      cols={cols}
    />
  );
}

export default Textarea;
