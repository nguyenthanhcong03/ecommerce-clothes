import { setOrderItems } from '@/store/slices/orderSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const { orderItems } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemoveOrderItem = (itemId) => {
    const newOrderItems = orderItems.filter((item) => item._id !== itemId);
    localStorage.setItem('orderItems', JSON.stringify(newOrderItems));
    dispatch(setOrderItems(newOrderItems));
  };

  // Khôi phục orderItems từ localStorage khi trang được tải lại
  useEffect(() => {
    if (!orderItems || orderItems.length === 0) {
      const itemsInLocalStorage = localStorage.getItem('orderItems');
      if (itemsInLocalStorage) {
        try {
          const parsedItems = JSON.parse(itemsInLocalStorage);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            dispatch(setOrderItems(parsedItems));
          } else {
            navigate('/shop');
          }
        } catch (error) {
          console.error('Lỗi khi phân tích orderItems từ localStorage:', error);
          navigate('/shop');
        }
      } else {
        navigate('/shop');
      }
    }
  }, [dispatch, orderItems, navigate]);

  return (
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
                const price = item.snapshot.price || item.snapshot.originalPrice;
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
  );
};

export default OrderList;
