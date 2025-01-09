import React from 'react';

function Button({ text, isPrimary = true }) {
  return (
    <button
      className={`h-[24px] w-full cursor-pointer rounded-[4px] border-[1px] border-primaryColor px-4 text-[10px] font-[350] text-primaryColor duration-300 hover:transition-colors sm:h-[40px] sm:text-sm ${isPrimary ? 'bg-primaryColor text-white hover:bg-white hover:text-primaryColor' : 'bg-white text-primaryColor hover:bg-primaryColor hover:text-white'}`}
    >
      {text}
    </button>
  );
}

export default Button;
