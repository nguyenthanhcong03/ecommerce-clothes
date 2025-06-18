import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';

const ShippingForm = ({ register, errors, provinces, districts, wards, watchProvince, watchDistrict, setValue }) => {
  const { user } = useSelector((state) => state.account);

  const fillUserInfo = () => {
    if (user) {
      // Điền thông tin cá nhân
      if (user.firstName && user.lastName) {
        setValue('fullName', `${user.lastName} ${user.firstName}`);
      }
      if (user.email) {
        setValue('email', user.email);
      }
      if (user.phone) {
        setValue('phoneNumber', user.phone);
      }

      // Điền thông tin địa chỉ
      if (user.address) {
        if (user.address.street) {
          setValue('street', user.address.street);
        }
        if (user.address.province) {
          setValue('province', user.address.province);
        }
        if (user.address.district) {
          setValue('district', user.address.district);
        }
        if (user.address.ward) {
          setValue('ward', user.address.ward);
        }
      }
    }
  };

  return (
    <div className='rounded-sm bg-white p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Thông tin giao hàng</h2>
        {user && (
          <button
            type='button'
            onClick={fillUserInfo}
            className='rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100'
          >
            Dùng thông tin cá nhân
          </button>
        )}
      </div>

      <div className='space-y-6'>
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
      </div>
    </div>
  );
};

ShippingForm.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    fullName: PropTypes.shape({ message: PropTypes.string }),
    email: PropTypes.shape({ message: PropTypes.string }),
    phoneNumber: PropTypes.shape({ message: PropTypes.string }),
    province: PropTypes.shape({ message: PropTypes.string }),
    district: PropTypes.shape({ message: PropTypes.string }),
    ward: PropTypes.shape({ message: PropTypes.string }),
    street: PropTypes.shape({ message: PropTypes.string })
  }),
  provinces: PropTypes.array.isRequired,
  districts: PropTypes.array.isRequired,
  wards: PropTypes.array.isRequired,
  watchProvince: PropTypes.string,
  watchDistrict: PropTypes.string,
  setValue: PropTypes.func.isRequired
};

export default ShippingForm;
