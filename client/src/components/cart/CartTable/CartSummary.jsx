import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/utils/formatCurrency';

const CartSummary = ({ subtotal, discount = 0, shipping = 0 }) => {
  const navigate = useNavigate();
  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  return (
    <div className='col-span-4 h-fit border p-4'>
      <h2 className='mb-4 text-lg font-semibold'>Tổng giỏ hàng</h2>

      <div className='space-y-3 border-b pb-4'>
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Tạm tính:</span>
          <span className='font-medium'>{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Giảm giá:</span>
            <span className='font-medium text-red-500'>-{formatCurrency(discount)}</span>
          </div>
        )}

        {shipping > 0 && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Phí vận chuyển:</span>
            <span className='font-medium'>{formatCurrency(shipping)}</span>
          </div>
        )}
      </div>

      <div className='my-4 flex justify-between text-lg font-semibold'>
        <span>Tổng cộng:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div className='space-y-3'>
        <Button onClick={handleCheckout} className='w-full bg-black text-white hover:opacity-90'>
          TIẾN HÀNH THANH TOÁN
        </Button>

        <Button onClick={handleContinueShopping} variant='secondary' className='w-full border hover:bg-gray-50'>
          TIẾP TỤC MUA SẮM
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
