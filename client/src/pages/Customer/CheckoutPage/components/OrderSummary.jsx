import { QuestionCircleOutlined } from '@ant-design/icons';
import { message, Spin, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/Button/Button';
import { formatCurrency } from '../../../../utils/format/formatCurrency';
import { useState } from 'react';
import { createNewOrder } from '@/store/slices/orderSlice';

const OrderSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loading,
    orderItems,
    shippingInfo,
    paymentMethod,
    coupon,
    distance,
    shippingCost,
    couponDiscount,
    calculatingDistance
  } = useSelector((state) => state.order);

  const [orderData, setOrderData] = useState(null); // state để lưu dữ liệu đơn hàng

  // Tính toán tổng tiền
  const subtotal = orderItems.reduce((total, item) => {
    const price = item.snapshot.price || item.snapshot.originalPrice;
    return total + price * item.quantity;
  }, 0);

  const totalPrice = Math.max(0, subtotal - couponDiscount + shippingCost);

  const handleCreateOrder = async (newOrderData) => {
    try {
      const response = await dispatch(createNewOrder(newOrderData));
      message.success('Đặt hàng thành công!');
    } catch (error) {
      console.log('Lỗi khi tạo đơn hàng:', error);
      message.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
    }
  };

  const handleSubmit = () => {
    // Chuẩn bị dữ liệu đơn hàng
    const newOrderData = {
      products: orderItems,
      shippingAddress: {
        fullName: shippingInfo?.fullName,
        street: shippingInfo?.street,
        province: shippingInfo?.province,
        district: shippingInfo?.district,
        ward: shippingInfo?.ward,
        phoneNumber: shippingInfo?.phoneNumber,
        email: shippingInfo?.email
      },
      paymentMethod: paymentMethod,
      note: shippingInfo?.note || '',
      couponCode: coupon?.code || '',
      distance: distance || 0
    };

    // Lưu lại orderData để có thể sử dụng khi xác nhận giá mới
    setOrderData(newOrderData);
    console.log('orderData', newOrderData);
    // 3. Tạo đơn hàng (COD sẽ tạo ngay, VNPay/Momo sẽ trả về paymentUrl)
    handleCreateOrder(newOrderData);
  };

  return (
    <div className='rounded-sm bg-white p-6'>
      <h2 className='mb-4 text-xl font-bold'>Tóm tắt đơn hàng</h2>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Tạm tính</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1 text-gray-600'>
            <span>{calculatingDistance ? 'Đang tính phí vận chuyển...' : 'Phí vận chuyển'}</span>
            <Tooltip title='Phí vận chuyển được tính dựa trên khoảng cách từ địa chỉ của bạn đến cửa hàng'>
              <QuestionCircleOutlined className='text-gray-400' />
            </Tooltip>
          </div>
          <span>{calculatingDistance ? <Spin size='small' /> : formatCurrency(shippingCost)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className='flex justify-between'>
            <span className='text-gray-600'>Giảm giá</span>
            <span className='font-medium text-red-600'>- {formatCurrency(couponDiscount)}</span>
          </div>
        )}

        <div className='border-t border-gray-200 pt-3'>
          <div className='flex justify-between'>
            <span className='text-base font-medium'>Tổng cộng</span>
            <span className='text-lg font-bold'>{formatCurrency(totalPrice)}</span>
          </div>
          <p className='mt-1 text-right text-xs text-gray-500'>Đã bao gồm VAT (nếu có)</p>
        </div>
      </div>

      <div className='mt-6 space-y-3'>
        <Button
          type='submit'
          form='form-order-shipping'
          onClick={handleSubmit}
          width='full'
          size='lg'
          isLoading={loading}
          disabled={loading || orderItems.length === 0 || calculatingDistance}
        >
          {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
        </Button>

        <Button type='button' variant='secondary' width='full' size='lg' onClick={() => navigate('/cart')}>
          Quay lại giỏ hàng
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;
