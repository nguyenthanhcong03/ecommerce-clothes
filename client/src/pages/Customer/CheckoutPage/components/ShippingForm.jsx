import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { memo } from 'react';
import { Controller } from 'react-hook-form';

const ShippingForm = ({ control, errors, provinces, districts, wards, watchProvince, watchDistrict }) => {
  return (
    <div className='rounded-sm bg-white p-6'>
      <h2 className='mb-6 text-xl font-bold'>Thông tin giao hàng</h2>

      <div className='space-y-6'>
        <div>
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
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Thành phố */}
          <Controller
            control={control}
            name='province'
            render={({ field }) => (
              <Select
                {...field}
                label='Tỉnh/Thành phố'
                placeholder='-- Chọn Tỉnh/Thành phố --'
                options={provinces}
                error={errors.province?.message}
                required
              />
            )}
          />

          {/* Quận/Huyện */}
          <Controller
            control={control}
            name='district'
            render={({ field }) => (
              <Select
                {...field}
                label='Quận/Huyện'
                placeholder='-- Chọn Quận/Huyện --'
                options={districts}
                error={errors.district?.message}
                required
                disabled={!watchProvince}
              />
            )}
          />
          {/* Phường/Xã */}
          <Controller
            control={control}
            name='ward'
            render={({ field }) => (
              <Select
                {...field}
                label='Phường/Xã'
                placeholder='-- Chọn Phường/Xã --'
                options={wards}
                error={errors.ward?.message}
                required
                disabled={!watchDistrict}
              />
            )}
          />
        </div>

        <div>
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
        </div>

        <div className='mb-6'>
          <label className='text-sm font-medium'>Ghi chú</label>
          <Controller
            control={control}
            name='note'
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
      </div>
    </div>
  );
};

export default memo(ShippingForm);
