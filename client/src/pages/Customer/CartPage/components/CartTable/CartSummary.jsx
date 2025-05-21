import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency } from '@/utils/format/formatCurrency';

const CartSummary = ({
  onNavigateToCheckout,
  onSelectAll,
  onRemoveMultipleItems,
  isSelectedAll,
  cartItems,
  selectedItems,
  subtotal,
  discount = 0,
  shipping = 0,
  loading = false
}) => {
  const navigate = useNavigate();
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const total = subtotal + shipping - discount;

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleRemoveMultipleItems = () => {
    if (selectedItems?.length > 0) {
      setIsConfirmPopupOpen(true);
    }
  };

  const confirmRemoveItems = () => {
    onRemoveMultipleItems(selectedItems);
    setIsConfirmPopupOpen(false);
  };

  return (
    <div className='col-span-4 h-fit border bg-white p-6'>
      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          checked={isSelectedAll}
          onChange={onSelectAll}
          className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
        />
        <label htmlFor=''>Chọn tất cả ({cartItems?.length || 0})</label>
        <button
          onClick={handleRemoveMultipleItems}
          className='text-red-500 hover:underline'
          disabled={!selectedItems?.length}
        >
          Xóa
        </button>
      </div>

      <div className='my-4 flex justify-between text-lg font-semibold'>
        <span>Tổng cộng ({selectedItems?.length || 0} sản phẩm):</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div className='space-y-3'>
        <Button onClick={onNavigateToCheckout} className='w-full bg-black text-white hover:opacity-90'>
          TIẾN HÀNH THANH TOÁN
        </Button>

        <Button onClick={handleContinueShopping} variant='secondary' className='w-full border hover:bg-gray-50'>
          TIẾP TỤC MUA SẮM
        </Button>
      </div>

      {/* Confirmation Popup */}
      <Modal isOpen={isConfirmPopupOpen} onClose={() => setIsConfirmPopupOpen(false)} size='sm' title='Xác nhận xóa'>
        <div className='space-y-4'>
          <p>Bạn có chắc chắn muốn xóa {selectedItems?.length} sản phẩm đã chọn khỏi giỏ hàng?</p>
          <div className='flex justify-end space-x-2'>
            <Button variant='secondary' onClick={() => setIsConfirmPopupOpen(false)}>
              Hủy
            </Button>
            <Button variant='danger' onClick={confirmRemoveItems}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

CartSummary.propTypes = {
  onNavigateToCheckout: PropTypes.func,
  onSelectAll: PropTypes.func,
  onRemoveMultipleItems: PropTypes.func,
  isSelectedAll: PropTypes.bool,
  cartItems: PropTypes.array,
  selectedItems: PropTypes.array,
  subtotal: PropTypes.number,
  discount: PropTypes.number,
  shipping: PropTypes.number,
  loading: PropTypes.bool
};

export default CartSummary;
