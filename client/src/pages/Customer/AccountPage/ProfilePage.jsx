import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { fetchUserById, updateUser } from '@/store/slices/userSlice';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import avatarDefault from '@/assets/images/user.png';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { uploadFile } from '@/services/fileService';
import Button from '@/components/common/Button/Button';
import { FileUser, UserRound } from 'lucide-react';
import { getProvincesAPI, getDistrictsAPI, getWardsAPI } from '@/services/mapService';
import { set } from 'date-fns';

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
    .oneOf(['Nam', 'Nữ', 'Khác'], 'Giới tính phải là Nam, Nữ hoặc Khác')
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
  ward: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  district: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  province: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.account);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // State cho địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    register,
    watch,
    setError,
    clearErrors,
    setValue
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      street: '',
      ward: '',
      district: '',
      province: ''
    }
  });

  const provinceName = watch('province');
  const districtName = watch('district');

  // Lấy thông tin người dùng khi component được tải
  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserById(user._id));
    }
  }, [dispatch, user]);
  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await getProvincesAPI();
        setProvinces(response);
        if (currentUser?.address?.province) {
          setValue('province', currentUser.address.province);
        }
      } catch (error) {
        console.error('Lỗi khi tải tỉnh/thành phố:', error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [currentUser, setValue]);

  // Load districts khi province thay đổi
  useEffect(() => {
    const selectedProvince = provinces.find((p) => p.label === provinceName);
    const fetchDistricts = async (provinceCode) => {
      setIsLoadingDistricts(true);
      try {
        const response = await getDistrictsAPI(provinceCode);
        setDistricts(response);

        // Nếu province thay đổi (không phải lần đầu load), reset district và ward
        if (provinceName !== currentUser?.address?.province) {
          setValue('district', '');
          setValue('ward', '');
        } else if (currentUser?.address?.district) {
          // Chỉ set giá trị district từ currentUser nếu province không thay đổi
          setValue('district', currentUser.address.district);
        }
      } catch (error) {
        console.error('Lỗi khi tải quận/huyện:', error);
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    if (selectedProvince) {
      fetchDistricts(selectedProvince.value);
    } else {
      setDistricts([]);
      setValue('district', '');
      setValue('ward', '');
    }
  }, [provinceName, provinces, currentUser, setValue]);

  // Load wards khi district thay đổi
  useEffect(() => {
    const selectedDistrict = districts.find((d) => d.label === districtName);
    const fetchWards = async (districtCode) => {
      setIsLoadingWards(true);
      try {
        const response = await getWardsAPI(districtCode);
        setWards(response);

        // Nếu district thay đổi (không phải lần đầu load), reset ward
        if (districtName !== currentUser?.address?.district) {
          setValue('ward', '');
        } else if (currentUser?.address?.ward) {
          // Chỉ set giá trị ward từ currentUser nếu district không thay đổi
          setValue('ward', currentUser.address.ward);
        }
      } catch (error) {
        console.error('Lỗi khi tải phường/xã:', error);
      } finally {
        setIsLoadingWards(false);
      }
    };

    if (selectedDistrict) {
      fetchWards(selectedDistrict.value);
    } else {
      setWards([]);
      setValue('ward', '');
    }
  }, [districtName, districts, currentUser, setValue]);

  // Set các trường khác
  useEffect(() => {
    if (currentUser) {
      console.log('currentUser', currentUser);
      setValue('username', currentUser.username);
      setValue('firstName', currentUser.firstName);
      setValue('lastName', currentUser.lastName);
      setValue('email', currentUser.email);
      setValue('phone', currentUser.phone);
      setValue('gender', currentUser.gender);
      setValue('dateOfBirth', currentUser.dateOfBirth || '');
      setValue('street', currentUser.address?.street || '');
    }
  }, [currentUser, setValue]);

  // Xử lý khi người dùng chọn ảnh đại diện mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 1MB)
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast.error('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 1MB');
        return;
      }

      // Kiểm tra loại file
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận định dạng JPG, PNG hoặc GIF');
        return;
      }

      // Lưu file để upload khi submit form
      setAvatarFile(file);

      // Tạo URL tạm thời để hiển thị preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      // Đánh dấu avatar đã thay đổi
      setAvatarChanged(true);

      toast.info('Đã chọn ảnh đại diện mới. Nhấn "Lưu thông tin" để cập nhật.', {
        autoClose: 3000,
        position: 'top-right'
      });
    }
  };
  // Xử lý cập nhật thông tin cá nhân
  const onSubmit = async (data) => {
    console.log('dataSubmit', data);
    if (!user || !user._id) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    } // Reset form errors before submission
    clearErrors(['username', 'email', 'phone']);
    try {
      // Xử lý địa chỉ - tạo mảng address nếu có thông tin địa chỉ
      const { street, ward, district, province, ...otherData } = data;
      const userData = { ...otherData };
      if (province && (!street || !ward || !district)) {
        // Nếu có tỉnh thành thì bắt buộc phải có ít nhất một trong các trường street, ward, district
        // throw new Error('Vui lòng cung cấp ít nhất một trong các trường địa chỉ: đường, phường/xã, quận/huyện.');
        if (!street) setError('street', { type: 'manual', message: 'Đường không được để trống.' });
        if (!ward) setError('ward', { type: 'manual', message: 'Phường/xã không được để trống.' });
        if (!district) setError('district', { type: 'manual', message: 'Quận/huyện không được để trống.' });
        return;
      }
      if (street && ward && district && province) {
        userData.address = {
          street: street || '',
          ward: ward || '',
          district: district || '',
          province: province || ''
        };
      } else if (!street && !ward && !district && !province) {
        userData.address = null;
      }
      // Xử lý upload avatar nếu có
      if (avatarFile) {
        try {
          // Upload avatar trước bằng fileService
          const uploadResponse = await uploadFile(avatarFile);
          // Lấy URL hình ảnh từ response
          if (uploadResponse?.data?.url) {
            // Thêm URL avatar vào dữ liệu cập nhật
            userData.avatar = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.error('Lỗi khi upload avatar:', uploadError);
          toast.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
        }
      }

      // Cập nhật thông tin người dùng với dữ liệu bao gồm avatar URL (nếu có)
      await dispatch(updateUser({ userId: user._id, userData })).unwrap();
      // Cập nhật lại thông tin người dùng
      await dispatch(fetchUserById(user._id));
      // Xóa file avatar khỏi state sau khi đã upload thành công
      setAvatarFile(null);
      setAvatarChanged(false);
      toast.success('Thông tin cá nhân đã được cập nhật thành công!', {
        render: 'Thông tin cá nhân đã được cập nhật thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
        hideProgressBar: false
      });
    } catch (error) {
      console.log('error', error);
      if (error?.errors) {
        error.errors.forEach(({ field, message }) => {
          setError(field, { type: 'server', message });
        });
      }
      // toast.update(toastId, {
      //   render: `Cập nhật thất bại: ${error?.errors ? error.errors.map((err) => err.message).join(', ') : 'Đã xảy ra lỗi'}`,
      //   type: 'error',
      //   isLoading: false,
      //   autoClose: 5000,
      //   closeButton: true,
      //   hideProgressBar: false
      // });
    }
  };

  // Các tùy chọn cho select
  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
  ];

  // Render hiệu ứng loading
  if (loading && !currentUser) {
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
          {' '}
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
                isLoading={isLoadingProvinces}
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
                isLoading={isLoadingDistricts}
                disabled={!provinceName || isLoadingDistricts}
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
                isLoading={isLoadingWards}
                disabled={!districtName || isLoadingWards}
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
                      firstName: currentUser.firstName || '',
                      lastName: currentUser.lastName || '',
                      username: currentUser.username || '',
                      email: currentUser.email || '',
                      phone: currentUser.phone || '',
                      gender: currentUser.gender || '',
                      dateOfBirth: currentUser.dateOfBirth || '',
                      street: currentUser.address?.street || '',
                      province: currentUser.address?.province || '',
                      district: currentUser.address?.district || '',
                      ward: currentUser.address?.ward || ''
                    });

                    // Reset avatar về giá trị ban đầu
                    setAvatarFile(null);
                    setAvatarPreview(currentUser.avatar || null);
                    setAvatarChanged(false);

                    toast.info('Đã khôi phục thông tin ban đầu', {
                      autoClose: 2000,
                      position: 'top-right'
                    });
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
