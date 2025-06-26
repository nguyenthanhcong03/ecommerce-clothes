import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { checkoutSchema } from '@/pages/customer/CheckoutPage/validationSchema';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '@/services/mapService';
import { calculateDistance, createNewOrder, setShippingInfo } from '@/store/slices/orderSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const ShippingForm = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.account);
  const { orderItems, paymentMethod, coupon, distance } = useSelector((state) => state.order);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const formRef = useRef();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      phoneNumber: user?.phone || '',
      email: user?.email || '',
      street: user?.address?.street || '',
      ward: user?.address?.ward
        ? {
            value: user.address.ward.code,
            label: user.address.ward.name
          }
        : null,
      district: user?.address?.district
        ? {
            value: user.address.district.code,
            label: user.address.district.name
          }
        : null,
      province: user?.address?.province
        ? {
            value: user.address.province.code,
            label: user.address.province.name
          }
        : null,
      note: ''
    }
  });

  const watchProvince = watch('province');
  const watchDistrict = watch('district');
  const watchWard = watch('ward');

  // Expose submit function ra ngoài
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formRef.current.requestSubmit(); // hoặc tự gọi handleSubmit()
    }
  }));

  const handleCreateOrder = async (newOrderData) => {
    try {
      const response = await dispatch(createNewOrder(newOrderData));
      message.success('Đặt hàng thành công!');
    } catch (error) {
      console.log('Lỗi khi tạo đơn hàng:', error);
      message.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
    }
  };

  // Xử lý khi submit form
  const onSubmit = (data) => {
    console.log('data', data);
    // Lưu thông tin giao hàng
    const shippingData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      street: data.street,
      province: {
        code: data?.province?.value,
        name: data?.province?.label
      },
      district: {
        code: data?.district?.value,
        name: data?.district?.label
      },
      ward: {
        code: data?.ward?.value,
        name: data?.ward?.label
      },
      note: data.note || ''
    };
    // Cập nhật thông tin giao hàng vào Redux
    dispatch(setShippingInfo(shippingData));

    // Chuẩn bị dữ liệu đơn hàng
    const newOrderData = {
      products: orderItems,
      shippingAddress: {
        fullName: shippingData?.fullName,
        street: shippingData?.street,
        province: shippingData?.province,
        district: shippingData?.district,
        ward: shippingData?.ward,
        phoneNumber: shippingData?.phoneNumber,
        email: shippingData?.email
      },
      paymentMethod: paymentMethod,
      note: shippingData?.note || '',
      couponCode: coupon?.code || '',
      distance: distance || 0
    }; // Lưu lại orderData để có thể sử dụng khi xác nhận giá mới
    props.setOrderData(newOrderData);
    console.log('orderData', newOrderData);
    // Tạo đơn hàng (COD sẽ tạo ngay, VNPay/Momo sẽ trả về paymentUrl)
    handleCreateOrder(newOrderData);
  };

  // // Điền thông tin người dùng vào form khi component mount hoặc user thay đổi
  // useEffect(() => {
  //   if (user) {
  //     setValue('fullName', `${user.firstName} ${user.lastName}`);
  //     setValue('phoneNumber', user.phone || '');
  //     setValue('email', user.email || '');

  //     if (user.address) {
  //       setValue('street', user.address.street || '');

  //       // Nếu có địa chỉ đầy đủ, set các giá trị địa điểm
  //       if (user.address.province) {
  //         setValue('province', {
  //           value: user.address.province.code,
  //           label: user.address.province.name
  //         });
  //       }

  //       if (user.address.district) {
  //         setValue('district', {
  //           value: user.address.district.code,
  //           label: user.address.district.name
  //         });
  //       }

  //       if (user.address.ward) {
  //         setValue('ward', {
  //           value: user.address.ward.code,
  //           label: user.address.ward.name
  //         });
  //       }
  //     }
  //   }
  // }, [user, setValue]);

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
        const response = await getDistrictsAPI(watchProvince.value);
        setDistricts(response);

        // Chỉ reset district và ward nếu không phải là lần đầu load với thông tin user
        const isUserInitialLoad = user?.address?.province?.code === watchProvince.value;
        if (!isUserInitialLoad) {
          setValue('district', null);
          setWards([]);
          setValue('ward', null);
        }
      } catch (error) {
        console.error('Error loading district:', error);
      }
    };

    if (watchProvince) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setValue('district', null);
      setWards([]);
      setValue('ward', null);
    }
  }, [watchProvince, setValue, user]);

  // Khi chọn quận => load phường/xã
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getWardsAPI(watchDistrict.value);
        setWards(response);

        // Chỉ reset ward nếu không phải là lần đầu load với thông tin user
        const isUserInitialLoad = user?.address?.district?.code === watchDistrict.value;
        if (!isUserInitialLoad) {
          setValue('ward', null);
        }
      } catch (error) {
        console.error('Error loading ward:', error);
      }
    };

    if (watchDistrict) {
      fetchWards(); // Tính phí vận chuyển khi đã chọn quận/huyện
      if (watchProvince && watchDistrict) {
        const storeLocation = '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội, Việt Nam';
        const customerLocation = `${watchDistrict.label}, ${watchProvince.label}, Việt Nam`;
        // Tính khoảng cách giữa hai địa điểm
        dispatch(calculateDistance({ storeLocation, customerLocation }));
      }
    } else {
      setWards([]);
      setValue('ward', null);
    }
  }, [watchProvince, watchDistrict, setValue, dispatch, user]);

  return (
    <div className='rounded-sm bg-white p-6'>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
        <div>
          {/* Họ tên */}
          <Controller
            name='fullName'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label='Họ và tên'
                placeholder='Nhập họ và tên'
                required={true}
                error={errors.fullName?.message}
              />
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Email */}
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='email'
                label='Email'
                placeholder='Nhập địa chỉ email'
                required
                error={errors.email?.message}
              />
            )}
          />

          {/* Số điện thoại */}
          <Controller
            name='phoneNumber'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='tel'
                label='Số điện thoại'
                placeholder='Nhập số điện thoại'
                required={true}
                error={errors.phoneNumber?.message}
              />
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Thành phố */}
          <Controller
            name='province'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label='Tỉnh/Thành phố'
                placeholder='-- Chọn Tỉnh/Thành phố --'
                options={provinces}
                error={errors.province?.message}
                required
                value={field.value?.value || ''}
                onChange={(e) => {
                  const selected = provinces.find((p) => p.value === +e.target.value);
                  field.onChange(selected);
                }}
              />
            )}
          />
          {/* Quận/Huyện */}

          <Controller
            name='district'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label='Quận/Huyện'
                placeholder='-- Chọn Quận/Huyện --'
                options={districts}
                error={errors.district?.message}
                required
                disabled={!watchProvince}
                value={field.value?.value || ''}
                onChange={(e) => {
                  const selected = districts.find((d) => d.value === +e.target.value);
                  field.onChange(selected);
                }}
              />
            )}
          />

          {/* Phường/Xã */}
          <Controller
            name='ward'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label='Phường/Xã'
                placeholder='-- Chọn Phường/Xã --'
                options={wards}
                error={errors.ward?.message}
                required
                disabled={!watchDistrict}
                value={field.value?.value || ''}
                onChange={(e) => {
                  const selected = wards.find((w) => w.value === +e.target.value);
                  field.onChange(selected);
                }}
              />
            )}
          />
        </div>

        <div>
          {/* Địa chỉ chi tiết */}
          <Controller
            name='street'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label='Địa chỉ chi tiết'
                placeholder='Nhập địa chỉ giao hàng'
                required
                error={errors.street?.message}
              />
            )}
          />
        </div>

        <div className='mb-6'>
          {/* Ghi chú */}
          <label className='text-sm font-medium'>Ghi chú</label>
          <Controller
            name='note'
            control={control}
            label='Ghi chú'
            render={({ field }) => (
              <textarea
                {...field}
                className='mt-1 w-full flex-1 resize-none rounded-sm border-[1px] border-gray-300 p-3 px-[10px] text-sm outline-none focus:border-primaryColor'
                placeholder='Nhập ghi chú cho đơn hàng (không bắt buộc)'
                rows={3}
              />
            )}
          />
        </div>
      </form>
    </div>
  );
});

ShippingForm.displayName = 'ShippingForm';

export default ShippingForm;
