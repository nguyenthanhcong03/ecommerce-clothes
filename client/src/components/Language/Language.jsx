import React, { Children, useState } from 'react';
import { SlArrowDown } from 'react-icons/sl';
import vnFlag from '@assets/images/icons8-vietnam-48.png';
import usaFlag from '@assets/images/icons8-usa-48.png';
import i18n from '@/i18n';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const languages = [
  {
    id: 1,
    icon: vnFlag,
    value: 'vi'
  },
  {
    id: 2,
    icon: usaFlag,
    value: 'en'
  }
];

function Language() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // Quản lý trạng thái mở/đóng Language
  const [selectedLanguage, setSelectedLanguage] = useState({
    id: 1,
    icon: vnFlag,
    value: 'vi'
  }); // Giá trị được chọn trong Language
  const handleToggleLanguage = () => setIsOpen(!isOpen); // Hàm thay đổi trạng thái Language

  const handleChangeLanguage = (option) => {
    i18n.changeLanguage(option.value);
    handleToggleLanguage();
    setSelectedLanguage(option);
  };

  return (
    <div className={`relative inline-block text-left`}>
      <button
        onClick={handleToggleLanguage}
        className='flex h-full max-h-[40px] w-[140px] items-center justify-between gap-2 py-2 text-left focus:outline-none'
      >
        <div className='flex items-center gap-2'>
          <img className='w-7' src={selectedLanguage.icon} alt='' />
          <p className='text-sm'>{t(`header.language.${selectedLanguage.value}`)}</p>
        </div>
        <SlArrowDown className={`transform text-xs transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* Language Menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } absolute right-0 z-10 mt-2 w-full border border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        <ul className='py-2'>
          {languages?.map((option) => (
            <li
              key={option.id}
              className='cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={(e) => handleChangeLanguage(option)}
              value={option.value}
            >
              {t(`header.language.${option.value}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Language;
