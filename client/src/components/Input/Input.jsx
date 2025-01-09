import React from 'react';

function Input({ placeholder, name, className }) {
  return (
    <input
      className={`max-h-[40px] flex-1 border-[1px] border-[#e1e1e1] px-[10px] py-[4px] text-sm outline-none ${className}`}
      type='text'
      placeholder={placeholder}
      name={name}
    />
  );
}

export default Input;
