import React, { useState } from 'react';
import Button from '../common/Button/Button';
import Popup from '../common/Popup/Popup';

const PopupExample = () => {
  const [isBasicPopupOpen, setIsBasicPopupOpen] = useState(false);
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [actionResult, setActionResult] = useState('');

  const handleConfirmAction = () => {
    setActionResult('Đã xác nhận hành động!');
    setIsConfirmPopupOpen(false);
  };

  const handleCancelAction = () => {
    setActionResult('Đã hủy hành động!');
    setIsConfirmPopupOpen(false);
  };

  return (
    <div className='space-y-6 p-6'>
      <h2 className='text-2xl font-bold'>Ví dụ về component Popup</h2>

      {/* Basic popup example */}
      <div className='space-y-2'>
        <h3 className='text-lg font-medium'>Popup cơ bản</h3>
        <Button onClick={() => setIsBasicPopupOpen(true)}>Mở Popup cơ bản</Button>

        <Popup isOpen={isBasicPopupOpen} onClose={() => setIsBasicPopupOpen(false)} title='Popup cơ bản'>
          <div className='space-y-4'>
            <p>Đây là nội dung của popup cơ bản.</p>
            <Button onClick={() => setIsBasicPopupOpen(false)}>Đóng</Button>
          </div>
        </Popup>
      </div>

      {/* Custom popup example */}
      <div className='space-y-2'>
        <h3 className='text-lg font-medium'>Popup tùy chỉnh</h3>
        <Button variant='secondary' onClick={() => setIsCustomPopupOpen(true)}>
          Mở Popup tùy chỉnh
        </Button>

        <Popup
          isOpen={isCustomPopupOpen}
          onClose={() => setIsCustomPopupOpen(false)}
          size='lg'
          position='top'
          className='bg-gray-50'
          hideCloseButton={true}
        >
          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>Popup tùy chỉnh</h3>
            <p>Đây là popup với kích thước lớn hơn, vị trí ở trên đầu và không có nút đóng mặc định.</p>
            <div className='flex justify-end'>
              <Button variant='primary' onClick={() => setIsCustomPopupOpen(false)}>
                Hoàn tất
              </Button>
            </div>
          </div>
        </Popup>
      </div>

      {/* Confirmation popup example */}
      <div className='space-y-2'>
        <h3 className='text-lg font-medium'>Popup xác nhận</h3>
        <Button variant='danger' onClick={() => setIsConfirmPopupOpen(true)}>
          Mở Popup xác nhận
        </Button>

        {actionResult && <div className='mt-2 rounded bg-green-100 p-2 text-green-800'>Kết quả: {actionResult}</div>}

        <Popup isOpen={isConfirmPopupOpen} onClose={() => setIsConfirmPopupOpen(false)} size='sm'>
          <div className='space-y-4'>
            <h3 className='text-lg font-bold'>Xác nhận hành động</h3>
            <p>Bạn có chắc chắn muốn thực hiện hành động này?</p>
            <div className='flex justify-end space-x-2'>
              <Button variant='secondary' onClick={handleCancelAction}>
                Hủy
              </Button>
              <Button variant='danger' onClick={handleConfirmAction}>
                Xác nhận
              </Button>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default PopupExample;
