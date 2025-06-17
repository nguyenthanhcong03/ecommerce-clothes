import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveCoupons } from '@/store/slices/couponSlice';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CopyOutlined,
  CheckOutlined,
  TagFilled,
  GiftFilled,
  ClockCircleFilled,
  ShoppingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Ticket } from 'lucide-react';

const VoucherPage = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    dispatch(fetchActiveCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedCode(code);
        toast.success('Đã sao chép mã giảm giá');
        setTimeout(() => setCopiedCode(null), 3000);
      },
      () => {
        toast.error('Không thể sao chép mã giảm giá');
      }
    );
  };
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: vi });
    } catch {
      return 'Không xác định';
    }
  };

  const formatDiscountValue = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discountValue);
  };

  const getDiscountDetail = (coupon) => {
    if (coupon.discountType === 'percentage') {
      if (coupon.maxDiscount > 0) {
        return `Giảm ${formatDiscountValue(coupon)} tối đa ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(coupon.maxDiscount)}`;
      }
      return `Giảm ${formatDiscountValue(coupon)}`;
    }
    return `Giảm ${formatDiscountValue(coupon)}`;
  };

  const getCouponTypeIcon = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return <TagFilled className='text-primary-600' />;
    }
    return <GiftFilled className='text-primary-600' />;
  };
  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 animate-pulse'>
          <div className='h-8 w-48 rounded-md bg-gray-200'></div>
          <div className='mt-2 h-4 w-96 rounded-md bg-gray-100'></div>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((item) => (
            <div key={item} className='overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm'>
              <div className='h-24 animate-pulse bg-gradient-to-r from-gray-200 to-gray-100'></div>
              <div className='space-y-3 p-4'>
                <div className='h-6 w-3/4 animate-pulse rounded-md bg-gray-200'></div>
                <div className='h-10 animate-pulse rounded-md bg-gray-100'></div>
                <div className='h-20 animate-pulse rounded-md bg-gray-50'></div>
              </div>
              <div className='border-t border-dashed border-gray-200 p-4'>
                <div className='h-10 animate-pulse rounded-md bg-gray-200'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className='mx-auto max-w-7xl bg-white p-4'>
      <div className='mb-8'>
        <div className='mb-4 flex items-center space-x-4'>
          <div className='rounded-lg bg-blue-100 p-2'>
            <Ticket className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Mã giảm giá của bạn</h1>
            <p className='hidden text-base text-gray-600 md:block'>
              Sử dụng các mã giảm giá dưới đây cho đơn hàng của bạn để nhận nhiều ưu đãi hấp dẫn.
            </p>
          </div>
        </div>
      </div>

      {coupons && coupons.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className='group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primaryColor/30 hover:shadow-lg hover:shadow-primaryColor/10'
            >
              {/* Header gradient section with clip-path */}
              <div className='relative'>
                {' '}
                <div
                  className={`relative p-4 text-white ${
                    coupon.discountType === 'percentage'
                      ? 'bg-gradient-to-r from-primaryColor to-primaryColor/80'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)' }}
                >
                  {/* Coupon name & icon */}
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                      {getCouponTypeIcon(coupon)}
                    </div>
                    <h3 className='text-lg font-semibold'>{coupon.name}</h3>
                  </div>

                  {/* Discount amount */}
                  <p className='mt-2 text-xl font-bold tracking-tight'>{getDiscountDetail(coupon)}</p>

                  {/* Remaining days badge - only if end date is available */}
                  {coupon.endDate && (
                    <div className='absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm'>
                      <ClockCircleFilled className='mr-1' />
                      {differenceInDays(new Date(coupon.endDate), new Date()) + 1} ngày còn lại
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon details section */}
              <div className='flex-1 p-4'>
                {/* Coupon code with copy button */}{' '}
                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-700'>Mã giảm giá:</p>
                  <div className='mt-1.5 flex items-center justify-between overflow-hidden rounded-md border border-dashed border-primaryColor/40 bg-primaryColor/5 px-3 py-2 transition-colors group-hover:border-primaryColor/70'>
                    <div className='flex-1'>
                      <span className='font-mono text-lg font-bold tracking-wider text-primaryColor'>
                        {coupon.code}
                      </span>
                      <div className='mt-1 text-xs text-gray-500'>
                        {copiedCode === coupon.code ? 'Đã sao chép!' : 'Nhấn để sao chép'}
                      </div>
                    </div>{' '}
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className='group/copy relative flex h-full min-w-[26px] items-center justify-center rounded-md bg-primaryColor/10 px-3 py-2 text-primaryColor transition-all hover:bg-primaryColor hover:text-white'
                      aria-label={copiedCode === coupon.code ? 'Đã sao chép mã' : 'Sao chép mã'}
                      aria-live='polite'
                      title='Sao chép mã'
                    >
                      {copiedCode === coupon.code ? (
                        <CheckOutlined className='text-lg' />
                      ) : (
                        <CopyOutlined className='text-lg' />
                      )}
                    </button>
                  </div>
                </div>
                {/* Coupon details */}
                <div className='space-y-3 text-sm'>
                  {/* Description */}
                  {coupon.description && <p className='text-gray-700'>{coupon.description}</p>}

                  {/* Min order value */}
                  {coupon.minOrderValue > 0 && (
                    <div className='flex items-center gap-2 rounded-md bg-amber-50 p-2 text-amber-700'>
                      <ShoppingOutlined />
                      <span>
                        Đơn hàng tối thiểu:
                        <span className='ml-1 font-bold text-amber-800'>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            coupon.minOrderValue
                          )}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Validity period */}
                  <div className='flex items-center gap-2 rounded-md bg-blue-50 p-2 text-blue-700'>
                    <ClockCircleFilled />
                    <span>
                      Hiệu lực:
                      <br />
                      Từ <span className='font-medium'>{formatDate(coupon.startDate)}</span>
                      <br />
                      Đến <span className='font-medium'>{formatDate(coupon.endDate)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer section with copy button */}
              <div className='border-t border-dashed border-gray-200 p-4'>
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className='relative w-full overflow-hidden rounded-md bg-primaryColor px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 before:absolute before:left-1/2 before:top-1/2 before:h-0 before:w-0 before:rounded-full before:bg-white/30 before:opacity-0 before:transition-all before:duration-500 hover:bg-primaryColor/90 active:scale-95 active:before:h-32 active:before:w-32 active:before:-translate-x-1/2 active:before:-translate-y-1/2 active:before:opacity-30'
                >
                  {/* {copiedCode === coupon.code ? (
                    <span className='flex items-center justify-center'>
                      <CheckOutlined className='mr-1.5' /> Đã sao chép mã
                    </span>
                  ) : (
                    <span className='flex items-center justify-center'>
                      <CopyOutlined className='mr-1.5' /> Sao chép mã
                    </span>
                  )} */}
                  Dùng ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md'>
          <div className='mb-8 overflow-hidden rounded-full bg-gray-50 p-6'>
            <div className='animate-pulse'>
              <TagFilled className='text-5xl text-gray-300' />
            </div>
          </div>
          <h3 className='mb-4 text-2xl font-medium text-gray-900'>Không có mã giảm giá nào</h3>
          <p className='max-w-md text-gray-600'>
            Hiện tại không có mã giảm giá nào đang hoạt động. Vui lòng quay lại sau để cập nhật các ưu đãi mới.
          </p>
          <div className='mt-6'>
            {' '}
            <button
              onClick={() => dispatch(fetchActiveCouponsAPI())}
              className='flex items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200'
              aria-label='Kiểm tra lại các mã giảm giá đang hoạt động'
            >
              <ExclamationCircleOutlined /> Kiểm tra lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherPage;
