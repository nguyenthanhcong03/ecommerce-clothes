import React from 'react';
import { TfiClose } from 'react-icons/tfi';
import Input from '../Input/Input';
import Dropdown from '../Dropdown/Dropdown';
import Button from '../Button/Button';

function SearchModal({ isOpenSearch, setIsOpenSearch }) {
  const handleToggleSearchModal = () => {
    setIsOpenSearch(!isOpenSearch);
  };
  return (
    <div>
      <div
        className={`fixed inset-0 z-40 bg-black ${isOpenSearch ? '!visible !bg-opacity-50' : 'invisible bg-opacity-0'} transition-all duration-300 ease-in`}
        onClick={handleToggleSearchModal}
      ></div>
      <div
        className={`fixed left-0 right-0 top-0 z-[9999] h-[600px] w-full -translate-y-full bg-white transition-transform duration-300 ease-in ${isOpenSearch ? '!translate-y-0' : ''}`}
      >
        <TfiClose
          className='hover:-rotate-90\\ absolute right-5 top-5 cursor-pointer text-2xl text-primaryColor opacity-100 transition-all duration-150 ease-in active:opacity-0'
          onClick={handleToggleSearchModal}
        />
        <div className='flex flex-col items-center justify-center'>
          <h1 className='p-7 text-2xl text-primaryColor'>Bạn muốn tìm món đồ nào?</h1>
          <div className='flex items-center justify-center'>
            <Dropdown className='h-[40px] w-[150px]'></Dropdown>
            <Input placeholder='Tìm kếm sản phẩm..' className='h-[40px] w-[500px]' />
            <div><Button isPrimary text={'Tìm kiếm'} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
