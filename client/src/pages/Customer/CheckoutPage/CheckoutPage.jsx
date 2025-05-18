import { yupResolver } from '@hookform/resolvers/yup';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { calculateDiscount, validateCoupon } from '../../../services/couponService';
import { processPayment } from '../../../services/paymentService';
import {
  applyCoupon,
  createNewOrder,
  removeCoupon,
  resetOrder,
  saveShippingInfo,
  selectOrderItems,
  selectOrderSuccess,
  setOrderItems,
  setPaymentMethod,
  updateOrderNote
} from '../../../store/slices/orderSlice';
import OrderSuccess from './components/OrderSuccess';
import OrderSummary from './components/OrderSummary';
import PaymentMethod from './components/PaymentMethod';
import ShippingForm from './components/ShippingForm';
import { checkoutSchema } from './validationSchema';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [storeAddress, setStoreAddress] = useState('227 Nguyễn Văn Cừ, Quận 5, Hồ Chí Minh, Việt Nam');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // State để lưu tên tỉnh/thành và quận/huyện
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  // Selectors từ Redux
  const orderSuccess = useSelector(selectOrderSuccess);
  const orderItems = useSelector(selectOrderItems);
  const shippingInfo = useSelector((state) => state.order.shippingInfo);
  const paymentMethod = useSelector((state) => state.order.paymentMethod);
  const isLoading = useSelector((state) => state.order.loading);
  const appliedCoupon = useSelector((state) => state.order.appliedCoupon);
  const distance = useSelector((state) => state.order.distance);

  // Setup form với validation schema tổng hợp
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      fullName: shippingInfo?.fullName || '',
      phoneNumber: shippingInfo?.phoneNumber || '',
      email: shippingInfo?.email || '',
      street: shippingInfo?.street || '',
      province: shippingInfo?.province || '',
      district: shippingInfo?.district || '',
      paymentMethod: paymentMethod || 'COD',
      note: ''
    },
    mode: 'onChange'
  });

  // Cập nhật options state khi ShippingForm cập nhật danh sách tỉnh/huyện
  const handleProvincesLoaded = (provinces) => {
    setProvinceOptions(provinces);
  };

  const handleDistrictsLoaded = (districts) => {
    setDistrictOptions(districts);
  };

  // Reset order state khi unmount component
  useEffect(() => {
    return () => {
      if (orderSuccess) {
        dispatch(resetOrder());
      }
    };
  }, [dispatch, orderSuccess]);

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Tính tổng tiền hiện tại để kiểm tra điều kiện áp dụng coupon
      const subtotal = orderItems.reduce((total, item) => {
        const price = item.snapshot.discountPrice || item.snapshot.price;
        return total + price * item.quantity;
      }, 0);

      const response = await validateCoupon(couponCode, subtotal);

      if (response) {
        const couponData = response;

        // Tính toán giảm giá
        const discountCalculation = calculateDiscount(couponData, subtotal);

        // Áp dụng coupon vào đơn hàng
        dispatch(
          applyCoupon({
            coupon: couponData,
            discountAmount: discountCalculation.discount
          })
        );

        toast.success(`Đã áp dụng mã giảm giá: ${couponData.code}`);
      } else {
        setCouponError(response?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error?.response?.data?.message || 'Đã xảy ra lỗi khi áp dụng mã giảm giá.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Xử lý xóa mã giảm giá đã áp dụng
  const handleRemoveCoupon = () => {
    try {
      dispatch(removeCoupon());
      setCouponCode('');
      setCouponError('');
      toast.success('Đã xóa mã giảm giá');
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error('Có lỗi xảy ra khi xóa mã giảm giá');
    }
  };

  // Xử lý khi submit form
  const onSubmit = (data) => {
    // 1. Tìm tên tỉnh/thành và quận/huyện từ mã
    const provinceObj = provinceOptions.find((p) => p.value == data.province) || {};
    const districtObj = districtOptions.find((d) => d.value == data.district) || {};
    const provinceName = provinceObj.label || data.province;
    const districtName = districtObj.label || data.district;

    // Lưu thông tin giao hàng
    const shippingData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      street: data.street,
      province: data.province,
      district: data.district,
      country: data.country
    };
    dispatch(saveShippingInfo(shippingData));
    dispatch(setPaymentMethod(data.paymentMethod));
    dispatch(updateOrderNote(data.note));

    // 2. Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      products: orderItems,
      shippingAddress: {
        fullName: data.fullName,
        street: data.street,
        province: provinceName,
        district: districtName,
        phoneNumber: data.phoneNumber,
        email: data.email
      },
      paymentMethod: data.paymentMethod,
      note: data.note || '',
      couponCode: couponCode || '',
      distance: distance || 0
    };
    console.log('orderData', orderData);

    // 3. Tạo đơn hàng
    dispatch(createNewOrder(orderData))
      .unwrap()
      .then((response) => {
        const orderId = response._id;

        if (data.paymentMethod === 'VNPay' || data.paymentMethod === 'Momo') {
          // Tính tổng giá trị đơn hàng để gửi đến cổng thanh toán
          let totalAmount = response.totalPrice;

          // Chuẩn bị thông tin thanh toán
          const paymentData = {
            amount: totalAmount,
            orderId: orderId,
            orderInfo: `Thanh toán đơn hàng #${orderId}`
          };

          // Xử lý thanh toán qua VNPay hoặc Momo
          const paymentMethod = data.paymentMethod;

          processPayment(paymentMethod, paymentData)
            .then((response) => {
              // Chuyển hướng người dùng đến trang thanh toán
              if (response && response.success && response.paymentUrl) {
                dispatch(setOrderItems([]));
                localStorage.removeItem('orderItems');
                window.location.href = response.paymentUrl;
              } else {
                toast.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
              }
            })
            .catch((error) => {
              console.error('Lỗi tạo URL thanh toán:', error);
              toast.error('Có lỗi xảy ra khi tạo liên kết thanh toán. Vui lòng thử lại sau.');
            });
        } else {
          // Xử lý các phương thức thanh toán khác (COD)
          dispatch(setOrderItems([])); // Xóa sản phẩm trong redux sau khi đặt hàng thành công
          localStorage.removeItem('orderItems'); // Xóa sản phẩm trong localStorage
          toast.success('Đặt hàng thành công!');
        }
      })
      .catch((error) => {
        console.error('Lỗi đặt hàng:', error);
        toast.error('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
      });
  };

  // Nếu đơn hàng đã hoàn tất, hiển thị trang thành công
  if (orderSuccess) {
    return <OrderSuccess />;
  }

  if (isLoading) {
    return <LoadingSpinner fullPage size='large' />;
  }

  return (
    <div className='mt-20 min-h-screen w-full bg-white'>
      <div className='flex min-h-[50px] items-center justify-center gap-4 bg-[#FAFAFA] text-xl md:min-h-[70px] lg:min-h-[120px]'>
        THANH TOÁN
      </div>
      <div className='mx-auto max-w-[1230px] py-10'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
            {/* Thông tin đặt hàng - Left Column */}
            <div className='space-y-6 lg:col-span-3'>
              {/* Shipping Information */}
              <ShippingForm
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onProvincesLoaded={handleProvincesLoaded}
                onDistrictsLoaded={handleDistrictsLoaded}
              />

              {/* Payment Methods */}
              <PaymentMethod register={register} errors={errors} watch={watch} />
            </div>

            {/* Order Summary - Right Column */}
            <OrderSummary
              isLoading={isLoading}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponLoading={couponLoading}
              couponError={couponError}
              setCouponError={setCouponError}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
