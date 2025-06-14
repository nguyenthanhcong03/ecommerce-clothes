import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Headline from '@/components/common/Headline/Headline';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '@/services/mapService';
import { yupResolver } from '@hookform/resolvers/yup';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { calculateDiscount, validateCoupon } from '../../../services/couponService';
import {
  applyCoupon,
  calculateDistance,
  confirmUpdatedPrices,
  createNewOrder,
  removeCoupon,
  resetOrder,
  saveShippingInfo,
  setPaymentMethod,
  setShowPriceChangeModal,
  updateOrderNote
} from '../../../store/slices/orderSlice';
import OrderSuccess from './components/OrderSuccess';
import OrderSummary from './components/OrderSummary';
import PaymentMethod from './components/PaymentMethod';
import PriceChangeModal from './components/PriceChangeModal';
import ShippingForm from './components/ShippingForm';
import { checkoutSchema } from './validationSchema';

const CheckoutPage = () => {
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Thêm biến state để lưu dữ liệu đơn hàng
  const [orderData, setOrderData] = useState(null);
  // Selectors từ Redux
  const orderSuccess = useSelector((state) => state.order.orderSuccess);
  const orderItems = useSelector((state) => state.order.orderItems);
  const shippingInfo = useSelector((state) => state.order.shippingInfo);
  const paymentMethod = useSelector((state) => state.order.paymentMethod);
  const isLoading = useSelector((state) => state.order.loading);
  const appliedCoupon = useSelector((state) => state.order.appliedCoupon);
  const distance = useSelector((state) => state.order.distance);
  const changedPriceProducts = useSelector((state) => state.order.changedPriceProducts);
  const updatedProducts = useSelector((state) => state.order.updatedProducts);
  const showPriceChangeModal = useSelector((state) => state.order.showPriceChangeModal);
  const paymentUrl = useSelector((state) => state.order.paymentUrl);

  // Setup form với validation schema tổng hợp
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    resetField
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

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');

  // Load danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvincesAPI();
        setProvinces(response);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  // Khi chọn tỉnh → load huyện
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await getDistrictsAPI(selectedProvince);
        setDistricts(response);
        setValue('district', '');
        setWards([]);
      } catch (error) {
        console.error('Error loading district:', error);
      }
    };
    if (selectedProvince) {
      fetchDistricts();
    }
  }, [selectedProvince, setValue]);

  // Khi chọn quận => load phường/xã
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getWardsAPI(selectedDistrict);
        setWards(response);
        setValue('ward', '');
      } catch (error) {
        console.error('Error loading ward:', error);
      }
    };
    if (selectedDistrict) {
      fetchWards();
      // Tính phí vận chuyển khi đã chọn quận/huyện
      if (selectedProvince && selectedDistrict) {
        const provinceName = provinces.find((p) => p.value === +selectedProvince)?.label;
        const districtName = districts.find((d) => d.value === +selectedDistrict)?.label;

        if (districtName && provinceName) {
          const customerLocation = `${districtName}, ${provinceName}, Việt Nam`;
          const storeLocation = '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội, Việt Nam';
          // Tính khoảng cách giữa hai địa điểm
          dispatch(calculateDistance({ storeLocation, customerLocation }));
        }
      }
    }
  }, [selectedProvince, selectedDistrict, provinces, districts, setValue, dispatch]);

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
        const price = item.snapshot.originalPrice || item.snapshot.price;
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
    const provinceName = provinces.find((p) => p.value === +data.province)?.label;
    const districtName = districts.find((d) => d.value === +data.district)?.label;
    const wardName = wards.find((w) => w.code === +data.ward)?.label;

    // Lưu thông tin giao hàng
    const shippingData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      street: data.street,
      province: data.province,
      district: data.district,
      ward: data.ward
    };
    dispatch(saveShippingInfo(shippingData));
    dispatch(setPaymentMethod(data.paymentMethod));
    dispatch(updateOrderNote(data.note));

    // 2. Chuẩn bị dữ liệu đơn hàng
    const newOrderData = {
      products: orderItems,
      shippingAddress: {
        fullName: data.fullName,
        street: data.street,
        province: provinceName,
        district: districtName,
        ward: wardName,
        phoneNumber: data.phoneNumber,
        email: data.email
      },
      paymentMethod: data.paymentMethod,
      note: data.note || '',
      couponCode: couponCode || '',
      distance: distance || 0
    };

    // Lưu lại orderData để có thể sử dụng khi xác nhận giá mới
    setOrderData(newOrderData);
    console.log('orderData', newOrderData); // 3. Tạo đơn hàng (COD sẽ tạo ngay, VNPay/Momo sẽ trả về paymentUrl)
    dispatch(createNewOrder(newOrderData));
  };

  // Xử lý khi đóng modal thay đổi giá
  const handleCancelPriceChange = () => {
    dispatch(setShowPriceChangeModal(false));
    toast.info('Đơn hàng đã được hủy do thay đổi giá.');
  };

  // Xử lý khi người dùng đồng ý với giá mới
  const handleConfirmPriceChange = () => {
    // Cập nhật giỏ hàng với giá mới
    dispatch(confirmUpdatedPrices());

    // Thực hiện đặt hàng lại với giá mới
    const updatedOrderData = {
      ...orderData,
      products: updatedProducts
    };

    toast.info('Đơn hàng đã được cập nhật với giá mới.');

    // Gọi lại API đặt hàng
    dispatch(createNewOrder(updatedOrderData));
  };

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

  if (isLoading) {
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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
            {/* Thông tin đặt hàng - Left Column */}
            <div className='space-y-6 lg:col-span-3'>
              {/* Shipping Information */}
              <ShippingForm
                control={control}
                errors={errors}
                provinces={provinces}
                districts={districts}
                wards={wards}
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
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
