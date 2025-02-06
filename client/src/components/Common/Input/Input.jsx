import React from 'react';

function Input({ placeholder, name, type = 'text', className }) {
  return (
    <input
      className={`h-[40px] w-full border-[1px] border-[#e1e1e1] px-[10px] py-[4px] text-sm outline-none ${className}`}
      type={type}
      placeholder={placeholder}
      name={name}
    />
  );
}

export default Input;
