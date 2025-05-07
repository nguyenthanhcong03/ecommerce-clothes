import React, { memo, useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { getDistrictsAPI, getProvincesAPI } from '@/services/mapService';
import { useDispatch, useSelector } from 'react-redux';
import { calculateDistance } from '../../../../store/slices/orderSlice';

const ShippingForm = ({ control, errors, watch, setValue, onProvincesLoaded, onDistrictsLoaded }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const { distance } = useSelector((state) => state.order.distance);

  const dispatch = useDispatch();

  // Watch city to update districts
  const watchedCity = watch('city');
  const watchedState = watch('state');

  // // Initialize selectedProvince from watchedCity on component mount
  // useEffect(() => {
  //   if (watchedCity && !selectedProvince) {
  //     setSelectedProvince(watchedCity);
  //   }
  //   if (watchedState && !selectedDistrict) {
  //     setSelectedDistrict(watchedState);
  //   }
  // }, [watchedCity, watchedState]);

  // Load danh sách tỉnh
  useEffect(() => {
    if (watchedCity && !selectedProvince) {
      setSelectedProvince(watchedCity);
    }
    if (watchedState && !selectedDistrict) {
      setSelectedDistrict(watchedState);
    }
    const fetchProvinces = async () => {
      try {
        const response = await getProvincesAPI();
        setProvinces(response);
        onProvincesLoaded(response);
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
        onDistrictsLoaded(response);

        // Don't reset state if there's a previously saved value
        // that matches the new district options
        const currentState = watchedState;
        if (!currentState) {
          setValue('state', '');
        } else {
          // Validate that the current state is in the new districts
          const stateExists = response.some((district) => district.value == currentState);
          if (!stateExists) {
            setValue('state', '');
          }
        }
      } catch (error) {
        console.error('Error loading district:', error);
      }
    };
    if (selectedProvince) {
      fetchDistricts();
    }
  }, [selectedProvince, setValue, watchedState]);

  // Khi chọn huyện → tính phí vận chuyển
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      let province = provinces.find((province) => province.value == selectedProvince);
      let district = districts.find((district) => district.value == selectedDistrict);

      if (province && district) {
        const customerLocation = `${district.label}, ${province.label}, Việt Nam`;
        const storeLocation = '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội, Việt Nam';

        // Tính khoảng cách giữa hai địa điểm
        dispatch(calculateDistance({ storeLocation, customerLocation }));
      }
    }
  }, [selectedDistrict, dispatch]);

  return (
    <div className='rounded-sm border bg-white p-6'>
      <h2 className='mb-6 text-xl font-bold'>Thông tin giao hàng</h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Họ tên */}
          <Controller
            control={control}
            name='fullName'
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

          {/* Số điện thoại */}
          <Controller
            control={control}
            name='phoneNumber'
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

        {/* Email */}
        <Controller
          control={control}
          name='email'
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Thành phố */}
          <Controller
            control={control}
            name='city'
            render={({ field }) => (
              <Select
                {...field}
                label='Tỉnh/Thành phố'
                placeholder='-- Chọn Tỉnh/Thành phố --'
                options={provinces}
                error={errors.city?.message}
                required
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedProvince(e.target.value);
                }}
              />
            )}
          />

          {/* Quận/Huyện */}
          <Controller
            control={control}
            name='state'
            render={({ field }) => (
              <Select
                {...field}
                label='Quận/Huyện'
                placeholder='-- Chọn Quận/Huyện --'
                options={districts}
                error={errors.state?.message}
                required
                disabled={!watchedCity}
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedDistrict(e.target.value);
                }}
              />
            )}
          />
        </div>

        {/* Địa chỉ chi tiết */}
        <Controller
          control={control}
          name='street'
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

        <div className='mb-6'>
          <label className='text-sm font-medium'>Ghi chú</label>
          <Controller
            control={control}
            name='note'
            render={({ field }) => (
              <textarea
                {...field}
                className='mt-1 w-full flex-1 resize-none rounded border-[1px] border-gray-300 p-3 px-[10px] text-sm outline-none focus:border-primaryColor'
                placeholder='Nhập ghi chú cho đơn hàng (không bắt buộc)'
                rows={3}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ShippingForm);
