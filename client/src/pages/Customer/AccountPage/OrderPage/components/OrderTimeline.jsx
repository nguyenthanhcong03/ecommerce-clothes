import React from 'react';
import { Clock } from 'lucide-react';
import { formatDate } from '@/utils/format/formatDate';

const OrderTimeline = ({ orderDetail }) => {
  return (
    <div className='rounded-sm border border-gray-200 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 flex items-center text-lg font-medium'>
        <Clock className='mr-2 h-5 w-5 text-gray-500' />
        Trạng thái đơn hàng
      </h2>

      <div className='relative'>
        {/* Timeline */}
        <div className='absolute bottom-0 left-3 top-0 w-0.5 bg-gray-200' />

        <div className='space-y-6'>
          {/* Đặt hàng */}
          <div className='relative pl-10'>
            <div className='absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#333] bg-white'>
              <div className='h-2 w-2 rounded-full bg-[#333]' />
            </div>
            <div>
              <p className='font-medium'>Đơn hàng đã được tạo</p>
              <p className='text-sm text-gray-500'>{formatDate(orderDetail?.createdAt)}</p>
            </div>
          </div>

          {/* Thanh toán (chỉ hiển thị nếu không phải COD) */}
          {orderDetail?.payment?.method !== 'COD' && (
            <div className='relative pl-10'>
              <div
                className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                  orderDetail?.payment?.isPaid ||
                  ['Pending', 'Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                    ? 'border-[#333] bg-white'
                    : 'border-orange-500 bg-white'
                } flex items-center justify-center`}
              >
                {orderDetail?.payment?.isPaid ||
                ['Pending', 'Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status) ? (
                  <div className='h-2 w-2 rounded-full bg-[#333]' />
                ) : (
                  <div className='h-2 w-2 rounded-full bg-orange-500' />
                )}
              </div>
              <div>
                <p
                  className={
                    orderDetail?.payment?.isPaid ||
                    ['Pending', 'Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                      ? 'font-medium text-green-600'
                      : 'font-medium text-orange-600'
                  }
                >
                  {orderDetail?.payment?.isPaid ||
                  ['Pending', 'Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                    ? 'Đã thanh toán'
                    : 'Đang chờ thanh toán'}
                </p>
                {orderDetail?.payment?.isPaid && orderDetail?.payment?.paidAt && (
                  <p className='text-sm text-gray-500'>{formatDate(orderDetail?.payment?.paidAt)}</p>
                )}
                {!orderDetail?.payment?.isPaid && orderDetail?.status === 'Unpaid' && (
                  <p className='text-sm text-orange-500'>Vui lòng thanh toán để hoàn tất đơn hàng</p>
                )}
              </div>
            </div>
          )}

          {/* Xác nhận */}
          <div className='relative pl-10'>
            <div
              className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                ['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                  ? 'border-[#333] bg-white'
                  : 'border-gray-300 bg-white'
              } flex items-center justify-center`}
            >
              {['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status) && (
                <div className='h-2 w-2 rounded-full bg-[#333]' />
              )}
            </div>
            <div>
              <p
                className={
                  ['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                    ? 'font-medium'
                    : 'text-gray-500'
                }
              >
                Đơn hàng đã được xác nhận
              </p>
              {orderDetail?.statusUpdates?.pending && (
                <p className='text-sm text-gray-500'>{formatDate(orderDetail?.statusUpdates?.pending)}</p>
              )}
            </div>
          </div>

          {/* Xử lý */}
          <div className='relative pl-10'>
            <div
              className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                ['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                  ? 'border-[#333] bg-white'
                  : 'border-gray-300 bg-white'
              } flex items-center justify-center`}
            >
              {['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status) && (
                <div className='h-2 w-2 rounded-full bg-[#333]' />
              )}
            </div>
            <div>
              <p
                className={
                  ['Processing', 'Shipping', 'Delivered'].includes(orderDetail?.status)
                    ? 'font-medium'
                    : 'text-gray-500'
                }
              >
                Đơn hàng đang được xử lý
              </p>
              {orderDetail?.statusUpdates?.processing && (
                <p className='text-sm text-gray-500'>{formatDate(orderDetail?.statusUpdates?.processing)}</p>
              )}
            </div>
          </div>

          {/* Giao hàng */}
          <div className='relative pl-10'>
            <div
              className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                ['Shipping', 'Delivered'].includes(orderDetail?.status)
                  ? 'border-[#333] bg-white'
                  : 'border-gray-300 bg-white'
              } flex items-center justify-center`}
            >
              {['Shipping', 'Delivered'].includes(orderDetail?.status) && (
                <div className='h-2 w-2 rounded-full bg-[#333]' />
              )}
            </div>
            <div>
              <p className={['Shipping', 'Delivered'].includes(orderDetail?.status) ? 'font-medium' : 'text-gray-500'}>
                Đơn hàng đang được giao
              </p>
              {orderDetail?.statusUpdates?.shipping && (
                <p className='text-sm text-gray-500'>{formatDate(orderDetail?.statusUpdates?.shipping)}</p>
              )}
            </div>
          </div>

          {/* Đã giao */}
          <div className='relative pl-10'>
            <div
              className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                orderDetail?.status === 'Delivered' ? 'border-[#333] bg-white' : 'border-gray-300 bg-white'
              } flex items-center justify-center`}
            >
              {orderDetail?.status === 'Delivered' && <div className='h-2 w-2 rounded-full bg-[#333]' />}
            </div>
            <div>
              <p className={orderDetail?.status === 'Delivered' ? 'font-medium' : 'text-gray-500'}>
                Đơn hàng đã được giao thành công
              </p>
              {orderDetail?.statusUpdates?.delivered && (
                <p className='text-sm text-gray-500'>{formatDate(orderDetail?.statusUpdates?.delivered)}</p>
              )}
            </div>
          </div>

          {/* Trạng thái hủy (nếu có) */}
          {orderDetail?.status === 'Cancelled' && (
            <div className='relative pl-10'>
              <div className='absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-500 bg-white'>
                <div className='h-2 w-2 rounded-full bg-red-500' />
              </div>
              <div>
                <p className='font-medium text-red-600'>Đơn hàng đã bị hủy</p>
                {orderDetail?.statusUpdates?.cancelled && (
                  <p className='text-sm text-gray-500'>{formatDate(orderDetail?.statusUpdates?.cancelled)}</p>
                )}
                {orderDetail?.cancelReason && (
                  <p className='mt-1 text-sm text-red-500'>Lý do: {orderDetail?.cancelReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
