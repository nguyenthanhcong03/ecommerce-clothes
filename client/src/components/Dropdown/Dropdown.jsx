import React, { Children, useState } from 'react';
import { SlArrowDown } from 'react-icons/sl';

function Dropdown({ className, options }) {
  const [isOpen, setIsOpen] = useState(false); // Quản lý trạng thái mở/đóng dropdown
  const [selectedValue, setSelectedValue] = useState('Tất cả'); // Giá trị được chọn trong dropdown
  const handleToggleDropdown = () => setIsOpen(!isOpen); // Hàm thay đổi trạng thái dropdown

  // Hàm lấy giá trị được chọn
  const handleSetValue = (e) => {
    handleToggleDropdown();
    setSelectedValue(e.target.innerText);
  };

  return (
    <div className={`relative inline-block text-left text-primaryColor ${className}`}>
      {/* Nút mở dropdown */}
      <button
        onClick={handleToggleDropdown}
        className='flex h-full max-h-[40px] w-full items-center justify-between gap-2 border-[1px] border-[#e1e1e1] px-4 py-2 text-left focus:outline-none'
      >
        <p className='text-sm'>{selectedValue}</p>
        <SlArrowDown className={`transform text-sm transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } absolute right-0 mt-2 w-full border border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        <ul className='py-2'>
          {options?.map((option) => (
            <li
              key={option.value}
              className='cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={(e) => handleSetValue(e)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dropdown;
