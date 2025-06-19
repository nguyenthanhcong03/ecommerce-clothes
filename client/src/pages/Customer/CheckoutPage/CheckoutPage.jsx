import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Headline from '@/components/common/Headline/Headline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CouponApply from '@/pages/customer/CheckoutPage/components/CouponApply';
import OrderList from '@/pages/customer/CheckoutPage/components/OrderList';
import { confirmUpdatedPrices, createNewOrder, resetOrder, setShowPriceChangeModal } from '@/store/slices/orderSlice';
import { message } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderSuccess from './components/OrderSuccess';
import OrderSummary from './components/OrderSummary';
import PaymentMethod from './components/PaymentMethod';
import PriceChangeModal from './components/PriceChangeModal';
import ShippingForm from './components/ShippingForm';

const CheckoutPage = () => {
  const dispatch = useDispatch();

  const { orderSuccess, loading, paymentUrl, showPriceChangeModal, changedPriceProducts, updatedProducts } =
    useSelector((state) => state.order);

  // Xử lý khi đóng modal thay đổi giá
  const handleCancelPriceChange = () => {
    dispatch(setShowPriceChangeModal(false));
    message.info('Đơn hàng đã được hủy do thay đổi giá.');
  };

  // Xử lý khi người dùng đồng ý với giá mới
  const handleConfirmPriceChange = () => {
    // Cập nhật giỏ hàng với giá mới
    dispatch(confirmUpdatedPrices());

    // Thực hiện đặt hàng lại với giá mới
    const updatedOrderData = {
      // ...orderData,
      products: updatedProducts
    };

    message.info('Đơn hàng đã được cập nhật với giá mới.');

    // Gọi lại API đặt hàng
    dispatch(createNewOrder(updatedOrderData));
  };

  // Reset order state khi unmount component
  useEffect(() => {
    return () => {
      if (orderSuccess) {
        dispatch(resetOrder());
      }
    };
  }, [dispatch, orderSuccess]);

  // Effect để xử lý chuyển hướng thanh toán online
  useEffect(() => {
    if (paymentUrl) {
      // Chuyển hướng đến trang thanh toán
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  // Nếu đơn hàng đã hoàn tất, hiển thị trang thành công
  if (orderSuccess) {
    return <OrderSuccess />;
  }

  if (loading) {
    return <LoadingSpinner fullPage size='large' />;
  }

  return (
    <div className='px-5 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb
          items={[
            {
              label: 'Cửa hàng',
              path: '/shop'
            },
            {
              label: 'Thanh toán',
              path: '/checkout'
            }
          ]}
        />
      </div>
      <div className='my-8 rounded-sm bg-white p-8'>
        <Headline text1={'đừng bỏ lỡ ưu đãi, hãy tiến hành thanh toán'} text2={'THANH TOÁN'} />
      </div>
      <div className=''>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
            {/* Thông tin đặt hàng - Left Column */}
            <div className='space-y-6 lg:col-span-3'>
              <ShippingForm />
              <PaymentMethod />
            </div>
            {/* Danh sách đơn hàng và tóm tắt - Right Column */}
            <div className='space-y-6 lg:sticky lg:top-5 lg:col-span-2 lg:self-start'>
              <OrderList />
              <CouponApply />
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Thêm modal thông báo thay đổi giá */}
      <PriceChangeModal
        visible={showPriceChangeModal}
        changedProducts={changedPriceProducts}
        onCancel={handleCancelPriceChange}
        onConfirm={handleConfirmPriceChange}
      />
    </div>
  );
};

export default CheckoutPage;
