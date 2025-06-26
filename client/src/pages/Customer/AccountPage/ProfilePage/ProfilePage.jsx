import avatarDefault from '@/assets/images/user.png';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { deleteFileAPI, uploadFileAPI } from '@/services/fileService';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '@/services/mapService';
import { fetchUserById, updateUser } from '@/store/slices/userSlice';
import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { message } from 'antd';
import { FileUser, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

// Các tùy chọn cho select
const genderOptions = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' }
];

// Schema xác thực cho form cập nhật thông tin cá nhân
const profileSchema = yup.object({
  firstName: yup
    .string()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  lastName: yup
    .string()
    .required('Họ là bắt buộc')
    .min(2, 'Họ phải có ít nhất 2 ký tự')
    .max(50, 'Họ không được quá 50 ký tự'),
  username: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(30, 'Tên đăng nhập không được quá 30 ký tự')
    .matches(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  phone: yup
    .string()
    .nullable()
    .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Số điện thoại không hợp lệ')
    .transform((value) => (value === '' ? null : value)),
  gender: yup
    .string()
    .nullable()
    .oneOf(['male', 'female', 'other'], 'Giới tính phải là Nam, Nữ hoặc Khác')
    .transform((value) => (value === '' ? null : value)),
  dateOfBirth: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test('is-valid-date', 'Ngày sinh không hợp lệ', function (value) {
      if (!value) return true; // Không bắt buộc
      const date = new Date(value);
      return !isNaN(date);
    })
    .test('is-not-future', 'Ngày sinh không thể trong tương lai', function (value) {
      if (!value) return true;
      const date = new Date(value);
      return date <= new Date();
    }),
  // Địa chỉ
  street: yup
    .string()
    .nullable()
    .max(200, 'Địa chỉ đường không được quá 200 ký tự')
    .transform((value) => (value === '' ? null : value)),
  ward: yup.object().nullable(),
  district: yup.object().nullable(),
  province: yup.object().nullable()
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.account);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || avatarDefault);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [loadingUpdateProfile, setLoadingUpdateProfile] = useState(false);

  // State cho địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setError,
    clearErrors,
    setValue
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      avatar: user?.avatar,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth || '',
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
        : null
    }
  });

  const watchProvince = watch('province');
  const watchDistrict = watch('district');
  const watchWard = watch('ward');

  // Xử lý khi người dùng chọn ảnh đại diện mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 1MB)
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        message.error('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 1MB');
        return;
      }

      // Kiểm tra loại file
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        message.error('Chỉ chấp nhận định dạng JPG, PNG hoặc GIF');
        return;
      }

      // Lưu file để upload khi submit form
      setAvatarFile(file);

      // Tạo URL tạm thời để hiển thị preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      // Đánh dấu avatar đã thay đổi
      setAvatarChanged(true);

      message.info('Đã chọn ảnh đại diện mới. Nhấn "Lưu thông tin" để cập nhật.');
    }
  };
  // Xử lý cập nhật thông tin cá nhân
  const onSubmit = async (data) => {
    console.log('dataSubmit', data);
    if (!user || !user._id) {
      message.error('Không tìm thấy thông tin người dùng');
      return;
    }

    clearErrors(['username', 'email', 'phone']);

    try {
      // Xử lý địa chỉ - tạo mảng address nếu có thông tin địa chỉ
      const { street, ward, district, province, ...otherData } = data;
      const userData = { ...otherData };
      if (province && (!street || !ward || !district)) {
        // Nếu có tỉnh thành thì bắt buộc phải chọn đầy đủ địa chỉ
        if (!street) setError('street', { type: 'manual', message: 'Đường không được để trống.' });
        if (!ward) setError('ward', { type: 'manual', message: 'Vui lòng chọn Phường/Xã.' });
        if (!district) setError('district', { type: 'manual', message: 'Vui lòng chọn Quận/Huyện.' });
        return;
      }
      if (street && ward && district && province) {
        userData.address = {
          street: street || '',
          province: {
            code: province?.value,
            name: province?.label
          },
          district: {
            code: district?.value,
            name: district?.label
          },
          ward: {
            code: ward?.value,
            name: ward?.label
          }
        };
      } else if (!street && !ward && !district && !province) {
        userData.address = null;
      }

      setLoadingUpdateProfile(true);
      // Xử lý upload avatar nếu có
      if (avatarFile) {
        try {
          // Upload avatar trước bằng fileService
          const uploadResponse = await uploadFileAPI(avatarFile, 'ecommerce/avatars');
          // Lấy URL hình ảnh từ response
          if (uploadResponse?.data?.url) {
            // Thêm URL avatar vào dữ liệu cập nhật
            userData.avatar = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.error('Lỗi khi upload avatar:', uploadError);
          message.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
        }
        if (currentUser?.avatar) {
          // Xóa ảnh avatar cũ không còn được sử dụng
          const oldAvatar = currentUser?.avatar || [];
          try {
            console.log('oldAvatar', oldAvatar);
            await deleteFileAPI(oldAvatar);
          } catch (deleteErr) {
            console.error('Lỗi khi xóa ảnh:', deleteErr);
          }
        }
      }

      console.log('userData', userData);

      // Cập nhật thông tin người dùng với dữ liệu bao gồm avatar URL (nếu có)
      await dispatch(updateUser({ userId: user._id, userData })).unwrap();
      // Cập nhật lại thông tin người dùng
      await dispatch(fetchUserById(user._id));
      // await dispatch(fetchCurrentUser());
      // Xóa file avatar khỏi state sau khi đã upload thành công
      setAvatarFile(null);
      setAvatarChanged(false);
      setLoadingUpdateProfile(false);
      message.success('Thông tin cá nhân đã được cập nhật thành công!');
    } catch (error) {
      console.log('error', error);
      if (error?.errors) {
        error.errors.forEach(({ field, message }) => {
          setError(field, { type: 'server', message });
        });
      }
      setLoadingUpdateProfile(false);
    }
  };

  // Lấy thông tin người dùng khi component được tải
  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserById(user._id));
    }
  }, [dispatch, user]);

  // Load provinces
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
      fetchWards();
    } else {
      setWards([]);
      setValue('ward', null);
    }
  }, [watchProvince, watchDistrict, setValue, dispatch, user]);

  // // Set các trường khác
  // useEffect(() => {
  //   if (currentUser) {
  //     console.log('currentUser', currentUser);
  //     setValue('username', currentUser.username);
  //     setValue('firstName', currentUser.firstName);
  //     setValue('lastName', currentUser.lastName);
  //     setValue('email', currentUser.email);
  //     setValue('phone', currentUser.phone);
  //     setValue('gender', currentUser.gender);
  //     setValue('dateOfBirth', currentUser.dateOfBirth || '');
  //     setValue('street', currentUser.address?.street || '');
  //   }
  // }, [currentUser, setValue]);

  // Render hiệu ứng loading
  if (loading || loadingUpdateProfile) {
    return (
      <div className='flex h-[60vh] w-full flex-col items-center justify-center p-8'>
        <div className='mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primaryColor border-t-transparent shadow-md'></div>
        <p className='text-md animate-pulse font-medium text-gray-600'>Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl bg-white p-4'>
      <div className='mb-8'>
        <div className='mb-4 flex items-center space-x-4'>
          <div className='rounded-lg bg-blue-100 p-2'>
            <UserRound className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Hồ sơ của tôi</h1>
            <p className='hidden text-base text-gray-600 md:block'>
              Cập nhật tên, email và các thông tin liên hệ để giữ hồ sơ của bạn luôn chính xác và đầy đủ.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='animate-fadeIn'>
        {/* Phần avatar */}
        <div className='mb-8'>
          <div className='flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0'>
            <div className='group relative h-32 w-32 overflow-hidden rounded-full border-4 border-primaryColor/20 shadow-lg transition-all duration-300 hover:border-primaryColor/40 hover:shadow-xl'>
              <img
                src={avatarPreview || avatarDefault}
                alt='Avatar'
                className='h-full w-full object-cover transition-all duration-300 group-hover:scale-105'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarDefault;
                }}
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-30'>
                <label className='hidden cursor-pointer rounded-full bg-white/80 p-2 text-sm text-gray-700 transition-all duration-300 hover:bg-white/90 group-hover:block'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/jpeg,image/png,image/jpg,image/gif'
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            <div className='flex flex-col space-y-3'>
              <p className='text-base font-medium text-gray-700'>Ảnh đại diện</p>
              <label className='flex w-fit cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:text-primaryColor'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12'
                  />
                </svg>
                Tải ảnh lên
                <input
                  type='file'
                  className='hidden'
                  accept='image/jpeg,image/png,image/jpg,image/gif'
                  onChange={handleAvatarChange}
                />
              </label>
              <p className='text-xs text-gray-500'>Định dạng: JPG, PNG, GIF. Kích thước tối đa: 1MB</p>
            </div>
          </div>
        </div>
        {/* Tên đăng nhập */}
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='text'
                label='Tên đăng nhập'
                placeholder='Nhập tên đăng nhập'
                required={true}
                prefix={<UserOutlined />}
                error={errors.username?.message}
              />
            )}
          />
        </div>
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* First name */}
          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='text'
                label='Tên của bạn'
                placeholder='Nhập tên của bạn'
                required={true}
                prefix={<UserOutlined />}
                error={errors.firstName?.message}
              />
            )}
          />

          {/* Last name */}
          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='text'
                label='Họ của bạn'
                placeholder='Nhập họ của bạn'
                required={true}
                prefix={<UserOutlined />}
                error={errors.lastName?.message}
              />
            )}
          />
        </div>
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Phone number */}
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='tel'
                label='Số điện thoại'
                placeholder='Nhập số điện thoại'
                required={true}
                prefix={<PhoneOutlined />}
                error={errors.phone?.message}
              />
            )}
          />

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
                required={true}
                prefix={<MailOutlined />}
                error={errors.email?.message}
              />
            )}
          />
        </div>
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Gender */}
          <Controller
            name='gender'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label='Giới tính'
                placeholder='-- Chọn giới tính --'
                options={genderOptions}
                error={errors.gender?.message}
              />
            )}
          />
          {/* Date of Birth */}
          <Controller
            name='dateOfBirth'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='date'
                label='Ngày sinh'
                placeholder='Chọn ngày sinh'
                prefix={<CalendarOutlined />}
                error={errors.dateOfBirth?.message}
              />
            )}
          />
        </div>

        {/* Địa chỉ section */}
        <div className='mb-6 mt-8'>
          <div className='mb-4 flex items-center space-x-4'>
            <div className='rounded-lg bg-green-100 p-2'>
              <FileUser className='h-5 w-5 text-green-600' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Địa chỉ</h2>
              <p className='text-sm text-gray-600'>Thông tin địa chỉ sẽ được sử dụng cho đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* Province */}
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
                value={field.value?.value || ''}
                onChange={(e) => {
                  const selected = provinces.find((p) => p.value === +e.target.value);
                  field.onChange(selected);
                }}
              />
            )}
          />
          {/* District */}
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
                disabled={!watchProvince}
                value={field.value?.value || ''}
                onChange={(e) => {
                  const selected = districts.find((d) => d.value === +e.target.value);
                  field.onChange(selected);
                }}
              />
            )}
          />
          {/* Ward */}
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

        {/* Street address */}
        <div className='mb-6'>
          <Controller
            name='street'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='text'
                label='Số nhà, đường'
                placeholder='Nhập số nhà, tên đường'
                error={errors.street?.message}
              />
            )}
          />
        </div>

        <div className='mt-8 flex justify-end'>
          <div className='flex gap-4'>
            {(isDirty || avatarChanged) && (
              <button
                type='button'
                className='rounded-sm border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
                onClick={() => {
                  if (currentUser) {
                    // Reset về giá trị ban đầu từ currentUser
                    // Clear all form errors
                    clearErrors();

                    // Reset form
                    reset({
                      firstName: currentUser?.firstName || '',
                      lastName: currentUser?.lastName || '',
                      username: currentUser?.username || '',
                      email: currentUser?.email || '',
                      phone: currentUser?.phone || '',
                      gender: currentUser?.gender || '',
                      dateOfBirth: currentUser?.dateOfBirth || '',
                      street: currentUser?.address?.street || '',
                      ward: currentUser?.address?.ward
                        ? {
                            value: currentUser.address.ward.code,
                            label: currentUser.address.ward.name
                          }
                        : null,
                      district: currentUser?.address?.district
                        ? {
                            value: currentUser.address.district.code,
                            label: currentUser.address.district.name
                          }
                        : null,
                      province: currentUser?.address?.province
                        ? {
                            value: currentUser.address.province.code,
                            label: currentUser.address.province.name
                          }
                        : null
                    });

                    // Reset avatar về giá trị ban đầu
                    setAvatarFile(null);
                    setAvatarPreview(currentUser.avatar || null);
                    setAvatarChanged(false);

                    message.info('Đã khôi phục thông tin ban đầu');
                  }
                }}
              >
                <span className='flex items-center gap-2'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Hủy thay đổi
                </span>
              </button>
            )}
            <Button
              type='submit'
              variant='primary'
              isLoading={loading}
              className='px-6 py-2.5 transition-all duration-200 hover:shadow-md hover:shadow-primaryColor/20 focus:ring-2 focus:ring-primaryColor focus:ring-offset-2'
            >
              <span className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Lưu thông tin
              </span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
