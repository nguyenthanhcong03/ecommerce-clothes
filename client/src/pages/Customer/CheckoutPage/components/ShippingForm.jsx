import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { checkoutSchema } from '@/pages/customer/CheckoutPage/validationSchema';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '@/services/mapService';
import { calculateDistance, setShippingInfo } from '@/store/slices/orderSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const ShippingForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.account);
  const { shippingInfo, note } = useSelector((state) => state.order);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [isProvinceLoaded, setIsProvinceLoaded] = useState(false);
  const [isDistrictLoaded, setIsDistrictLoaded] = useState(false);
  const [isWardLoaded, setIsWardLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: shippingInfo?.fullName || '',
      phoneNumber: shippingInfo?.phoneNumber || '',
      email: shippingInfo?.email || '',
      street: shippingInfo?.street || '',
      ward: shippingInfo?.ward || '',
      district: shippingInfo?.district || '',
      province: shippingInfo?.province || '',
      note: note || ''
    }
  });

  const watchProvince = watch('province');
  const watchDistrict = watch('district');

  // Xử lý khi submit form
  const onSubmit = (data) => {
    console.log('data', data);
    // Lưu thông tin giao hàng
    const shippingData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      street: data.street,
      province: data.province,
      district: data.district,
      ward: data.ward,
      note: data.note || ''
    };
    dispatch(setShippingInfo(shippingData));
  };

  // Load danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvincesAPI();
        setProvinces(response);
        setIsProvinceLoaded(true);
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
        const response = await getDistrictsAPI(watchProvince);
        setDistricts(response);
        setIsDistrictLoaded(true);
        setValue('district', '');
        setWards([]);
        setValue('ward', '');
      } catch (error) {
        console.error('Error loading district:', error);
      }
    };

    if (watchProvince) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setValue('district', '');
      setWards([]);
      setValue('ward', '');
    }
  }, [watchProvince, setValue]);

  // Khi chọn quận => load phường/xã
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getWardsAPI(watchDistrict);
        setWards(response);
        setIsWardLoaded(true);
        setValue('ward', '');
      } catch (error) {
        console.error('Error loading ward:', error);
      }
    };
    if (watchDistrict) {
      fetchWards();

      // Tính phí vận chuyển khi đã chọn quận/huyện
      if (watchProvince && watchDistrict) {
        const watchProvinceName = provinces.find((p) => p.value === +watchProvince)?.label || '';
        const watchDistrictcode = districts.find((d) => d.value === +watchDistrict)?.label || '';

        const customerLocation = `${watchDistrictcode}, ${watchProvinceName}, Việt Nam`;
        console.log('customerLocation', customerLocation);
        const storeLocation = '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội, Việt Nam';
        // Tính khoảng cách giữa hai địa điểm
        dispatch(calculateDistance({ storeLocation, customerLocation }));
      }
    } else {
      setWards([]);
      setValue('ward', '');
    }
  }, [watchProvince, watchDistrict, provinces, districts, setValue, dispatch]);

  // ✅ Nếu có user, điền dữ liệu mặc định
  useEffect(() => {
    if (!user) return;
    reset({
      fullName: user?.lastName + ' ' + user?.firstName,
      email: user?.email,
      phoneNumber: user?.phone,
      street: user?.address?.street
    });
    if (user?.address && isProvinceLoaded) {
      setValue('province', user?.address?.province || '');
    }
    if (user?.address && isDistrictLoaded) {
      setValue('district', user?.address?.district || '');
    }
    if (user?.address && isWardLoaded) {
      setValue('ward', user?.address?.ward || '');
    }
  }, [user, isProvinceLoaded, isDistrictLoaded, isWardLoaded, setValue, reset]);

  return (
    <div className='rounded-sm bg-white p-6'>
      <form id='form-order-shipping' onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
        <div>
          {/* Họ tên */}
          <Input
            {...register('fullName')}
            label='Họ và tên'
            placeholder='Nhập họ và tên'
            required={true}
            error={errors.fullName?.message}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Email */}
          <Input
            {...register('email')}
            type='email'
            label='Email'
            placeholder='Nhập địa chỉ email'
            required
            error={errors.email?.message}
          />

          {/* Số điện thoại */}
          <Input
            {...register('phoneNumber')}
            type='tel'
            label='Số điện thoại'
            placeholder='Nhập số điện thoại'
            required={true}
            error={errors.phoneNumber?.message}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Thành phố */}
          <Select
            {...register('province')}
            label='Tỉnh/Thành phố'
            placeholder='-- Chọn Tỉnh/Thành phố --'
            options={provinces}
            error={errors.province?.message}
            required
          />

          {/* Quận/Huyện */}
          <Select
            {...register('district')}
            label='Quận/Huyện'
            placeholder='-- Chọn Quận/Huyện --'
            options={districts}
            error={errors.district?.message}
            required
            disabled={!watchProvince}
          />
          {/* Phường/Xã */}
          <Select
            {...register('ward')}
            label='Phường/Xã'
            placeholder='-- Chọn Phường/Xã --'
            options={wards}
            error={errors.ward?.message}
            required
            disabled={!watchDistrict}
          />
        </div>

        <div>
          {/* Địa chỉ chi tiết */}
          <Input
            {...register('street')}
            label='Địa chỉ chi tiết'
            placeholder='Nhập địa chỉ giao hàng'
            required
            error={errors.street?.message}
          />
        </div>

        <div className='mb-6'>
          <label className='text-sm font-medium'>Ghi chú</label>
          <textarea
            {...register('note')}
            className='mt-1 w-full flex-1 resize-none rounded-sm border-[1px] border-gray-300 p-3 px-[10px] text-sm outline-none focus:border-primaryColor'
            placeholder='Nhập ghi chú cho đơn hàng (không bắt buộc)'
            rows={3}
          />
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;
