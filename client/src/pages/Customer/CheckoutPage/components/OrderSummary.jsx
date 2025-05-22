import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../../components/common/Button/Button';
import Input from '../../../../components/common/Input/Input';
import { formatCurrency } from '../../../../utils/format/formatCurrency';
import { Spin, Alert, Tooltip } from 'antd';
import { CloseOutlined, QuestionCircleOutlined, TagOutlined } from '@ant-design/icons';
import { Trash2 } from 'lucide-react';
import { setOrderItems } from '../../../../store/slices/orderSlice';

const OrderSummary = ({
  isLoading,
  handleApplyCoupon,
  handleRemoveCoupon,
  couponCode,
  setCouponCode,
  couponLoading,
  couponError,
  setCouponError
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderItems = useSelector((state) => state.order.orderItems);
  const shippingCost = useSelector((state) => state.order.shippingCost);
  const couponDiscount = useSelector((state) => state.order.couponDiscount);
  const appliedCoupon = useSelector((state) => state.order.appliedCoupon);
  const calculatingDistance = useSelector((state) => state.order.calculatingDistance);

  // Tính toán tổng tiền
  const subtotal = orderItems.reduce((total, item) => {
    const price = item.snapshot.discountPrice || item.snapshot.price;
    return total + price * item.quantity;
  }, 0);

  const totalPrice = Math.max(0, subtotal - couponDiscount + shippingCost);

  // Auto hide coupon error after 3 seconds
  useEffect(() => {
    let timer;
    if (couponError) {
      timer = setTimeout(() => {
        if (typeof setCouponError === 'function') {
          setCouponError('');
        }
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [couponError, setCouponError]);

  // Khôi phục orderItems từ localStorage khi trang được tải lại
  useEffect(() => {
    if (!orderItems || orderItems.length === 0) {
      const savedItems = localStorage.getItem('orderItems');
      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            dispatch(setOrderItems(parsedItems));
          } else {
            navigate('/cart');
          }
        } catch (error) {
          console.error('Lỗi khi phân tích orderItems từ localStorage:', error);
          navigate('/cart');
        }
      } else {
        navigate('/cart');
      }
    }
  }, [dispatch, orderItems]);

  const handleRemoveOrderItem = (itemId) => {
    const updatedOrderItems = orderItems.filter((item) => item._id !== itemId);
    localStorage.setItem('orderItems', JSON.stringify(updatedOrderItems));
    dispatch(setOrderItems(updatedOrderItems));
  };

  return (
    <div className='space-y-6 lg:sticky lg:top-5 lg:col-span-2 lg:self-start'>
      {/* Product List */}
      <div className='rounded-sm bg-white p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Sản phẩm đặt hàng</h2>
          <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
            {orderItems.length} sản phẩm
          </span>
        </div>

        <div
          id='products-container'
          className={`mt-4 rounded-sm border ${orderItems.length > 3 ? 'max-h-[300px] overflow-y-auto' : ''}`}
        >
          {orderItems.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-3 text-left text-xs font-medium uppercase text-gray-500'>Sản phẩm</th>
                  <th className='px-3 py-3 text-center text-xs font-medium uppercase text-gray-500'>SL</th>
                  <th className='px-3 py-3 text-right text-xs font-medium uppercase text-gray-500'>Thành tiền</th>
                  <th className='px-3 py-3 text-center text-xs font-medium uppercase text-gray-500'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {orderItems.map((item) => {
                  const price = item.snapshot.discountPrice || item.snapshot.price;
                  return (
                    <tr key={item.variantId} className='hover:bg-gray-50'>
                      <td className='px-3 py-3'>
                        <div className='flex items-center'>
                          <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200'>
                            <img
                              className='h-full w-full object-cover object-center'
                              src={item.snapshot.image}
                              alt={item.snapshot.name}
                            />
                          </div>
                          <div className='ml-4 w-full'>
                            <div className='line-clamp-2 text-sm font-medium text-gray-900'>{item.snapshot.name}</div>
                            <div className='mt-1 text-xs text-gray-500'>
                              {item.snapshot.color && <span>{item.snapshot.color}</span>}
                              {item.snapshot.size && <span> | {item.snapshot.size}</span>}
                            </div>
                            <div className='mt-1 text-xs text-gray-500'>{formatCurrency(price)}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-3 py-3 text-center text-sm font-medium'>{item.quantity}</td>
                      <td className='px-3 py-3 text-right text-sm font-medium'>
                        {formatCurrency(price * item.quantity)}
                      </td>
                      <td>
                        <Trash2
                          strokeWidth={1.5}
                          cursor={'pointer'}
                          width={16}
                          onClick={() => handleRemoveOrderItem(item._id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className='py-8 text-center text-gray-500'>Không có sản phẩm trong giỏ hàng</div>
          )}
        </div>
      </div>

      {/* Coupon */}
      <div className='rounded-sm bg-white p-6'>
        <div className='flex items-center gap-2'>
          <TagOutlined className='text-blue-600' />
          <h3 className='font-medium'>Mã giảm giá</h3>
        </div>

        <div className='mt-3'>
          <div className='w-full'>
            <div className='flex items-center gap-1'>
              <div className='flex-1'>
                <Input
                  type='text'
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder='Nhập mã giảm giá'
                  className='h-[38px]'
                  disabled={couponLoading || !!appliedCoupon}
                />
              </div>
              {appliedCoupon ? (
                <Button
                  type='button'
                  onClick={handleRemoveCoupon}
                  className='bg-red-500 hover:bg-red-600'
                  disabled={couponLoading}
                >
                  {couponLoading ? (
                    <Spin size='small' />
                  ) : (
                    <>
                      <CloseOutlined />
                      Xóa
                    </>
                  )}
                </Button>
              ) : (
                <Button type='button' onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}>
                  {couponLoading ? <Spin size='small' /> : 'Áp dụng'}
                </Button>
              )}
            </div>
            {couponError && (
              <div className='mt-2'>
                <Alert message={couponError} type='error' showIcon />
              </div>
            )}
            {appliedCoupon && (
              <div className='mt-2'>
                <Alert
                  message={`Đã áp dụng mã giảm giá: ${appliedCoupon.code}`}
                  description={appliedCoupon.description}
                  type='success'
                  showIcon
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
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
            width='full'
            size='lg'
            isLoading={isLoading}
            disabled={isLoading || orderItems.length === 0 || calculatingDistance}
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
          </Button>

          <Button type='button' variant='secondary' width='full' size='lg' onClick={() => navigate('/cart')}>
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
