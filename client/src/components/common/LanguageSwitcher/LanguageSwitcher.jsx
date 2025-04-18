import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usFlag from '@/assets/images/icons8-usa-48.png';
import vnFlag from '@/assets/images/icons8-vietnam-48.png';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: usFlag },
  { code: 'vi', label: 'Tiếng Việt', flag: vnFlag }
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className='relative inline-block text-left'>
      <button
        onClick={() => setOpen(!open)}
        className='flex h-full max-h-[40px] w-[150px] items-center justify-between text-left focus:outline-none'
      >
        <div className='flex items-center gap-2'>
          <img className='w-7' src={currentLang.flag} />
          <span className='text-sm'>{currentLang.label}</span>
        </div>
        <ChevronDown strokeWidth={1} className={`transform transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      <div
        className={`${
          open ? 'block' : 'hidden'
        } absolute right-0 z-10 mt-2 w-full border border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className='flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
          >
            <img className='mr-2 w-6' src={lang.flag} />
            {/* <span className='mr-2'>{lang.flag}</span> */}
            {t(`header.language.${lang.code}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
