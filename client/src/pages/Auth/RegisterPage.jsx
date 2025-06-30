import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import useDebounce from '@/hooks/useDebounce';
import { checkEmailExistsAPI, checkUsernameExistsAPI } from '@/services/authService';
import { clearSuccessMessage, registerUser } from '@/store/slices/accountSlice';
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

// Định nghĩa schema validation với yup
const registerSchema = yup.object().shape({
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
    .required('Số điện thoại là bắt buộc')
    .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Số điện thoại không hợp lệ'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
});

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // State cho việc kiểm tra username và email
  const [usernameCheck, setUsernameCheck] = useState({ isChecking: false, message: '', error: false });
  const [emailCheck, setEmailCheck] = useState({ isChecking: false, message: '', error: false });
  // Lấy state từ Redux store
  const { isLoading, successMessage } = useSelector((state) => state.account);
  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Watch cho username và email để kiểm tra real-time
  const watchedUsername = watch('username');
  const watchedEmail = watch('email');

  // Debounce values
  const debouncedUsername = useDebounce(watchedUsername, 500);
  const debouncedEmail = useDebounce(watchedEmail, 500);

  // Hiệu ứng hiển thị thông báo thành công
  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccessMessage());
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      // Giữ lại thông tin về trang trước đó từ location.state
      setTimeout(() => {
        navigate('/login', { state: location.state });
      }, 2000);
    }
  }, [successMessage, dispatch, navigate, location.state]); // Kiểm tra username khi người dùng nhập
  useEffect(() => {
    const checkUsername = async () => {
      // Regex pattern cho username hợp lệ
      const usernamePattern = /^[a-zA-Z0-9._-]+$/;

      if (debouncedUsername && debouncedUsername.length >= 3) {
        // Chỉ kiểm tra API nếu username hợp lệ theo regex
        if (usernamePattern.test(debouncedUsername)) {
          setUsernameCheck({ isChecking: true, message: '', error: false });

          try {
            const result = await checkUsernameExistsAPI(debouncedUsername);

            if (result.success) {
              setUsernameCheck({
                isChecking: false,
                message: result.message,
                error: result.exists
              });
              // Chỉ setError khi username tồn tại, không xóa lỗi validation khác
              if (result.exists) {
                setError('username', {
                  type: 'manual',
                  message: 'Tên đăng nhập đã tồn tại'
                });
              } else {
                // Clear manual error nếu username không tồn tại và hợp lệ
                clearErrors('username');
              }
            }
          } catch {
            setUsernameCheck({
              isChecking: false,
              message: 'Không thể kiểm tra username',
              error: false
            });
          }
        } else {
          // Username không hợp lệ theo regex, reset state nhưng không xóa lỗi validation
          setUsernameCheck({ isChecking: false, message: '', error: false });
        }
      } else if (debouncedUsername === '') {
        setUsernameCheck({ isChecking: false, message: '', error: false });
        // Clear manual errors khi username rỗng
        clearErrors('username');
      }
    };

    checkUsername();
  }, [debouncedUsername, setError, clearErrors]);

  // Xử lý khi submit form
  const onSubmit = async (data) => {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...registerData } = data;

    try {
      // Dispatch action đăng ký
      dispatch(registerUser(registerData));
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
    }
  }; // Kiểm tra email khi người dùng nhập
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (debouncedEmail && emailRegex.test(debouncedEmail)) {
        setEmailCheck({ isChecking: true, message: '', error: false });

        try {
          const result = await checkEmailExistsAPI(debouncedEmail);

          if (result.success) {
            setEmailCheck({
              isChecking: false,
              message: result.message,
              error: result.exists
            });
            // Chỉ setError khi email tồn tại, không xóa lỗi validation khác
            if (result.exists) {
              setError('email', {
                type: 'manual',
                message: 'Email đã tồn tại'
              });
            } else {
              // Clear manual error nếu email không tồn tại và hợp lệ
              clearErrors('email');
            }
          }
        } catch {
          setEmailCheck({
            isChecking: false,
            message: 'Không thể kiểm tra email',
            error: false
          });
        }
      } else if (debouncedEmail === '') {
        setEmailCheck({ isChecking: false, message: '', error: false }); // Clear manual errors khi email rỗng
        clearErrors('email');
      }
    };

    checkEmail();
  }, [debouncedEmail, setError, clearErrors]);

  return (
    <div className='w-full rounded-lg bg-white p-8 shadow-sm'>
      <h2 className='mb-6 text-center text-2xl font-bold text-gray-800'>Đăng ký tài khoản</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
        {/* Họ và Tên */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Controller
            control={control}
            name='firstName'
            render={({ field }) => (
              <Input
                {...field}
                label='Tên'
                placeholder='Nhập tên của bạn'
                prefix={<UserOutlined className='text-gray-400' />}
                required
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <Input
                {...field}
                label='Họ'
                placeholder='Nhập họ của bạn'
                prefix={<UserOutlined className='text-gray-400' />}
                required
                error={errors.lastName?.message}
              />
            )}
          />
        </div>
        {/* Tên đăng nhập */}
        <Controller
          control={control}
          name='username'
          render={({ field }) => (
            <div>
              <Input
                {...field}
                label='Tên đăng nhập'
                placeholder='Nhập tên đăng nhập'
                prefix={<UserOutlined className='text-gray-400' />}
                required
                error={errors.username?.message}
              />
            </div>
          )}
        />
        {/* Email và Số điện thoại */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Controller
            control={control}
            name='email'
            render={({ field }) => (
              <div>
                <Input
                  {...field}
                  type='email'
                  label='Email'
                  placeholder='Nhập địa chỉ email'
                  prefix={<MailOutlined className='text-gray-400' />}
                  required
                  error={errors.email?.message}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name='phone'
            render={({ field }) => (
              <Input
                {...field}
                type='tel'
                label='Số điện thoại'
                placeholder='Nhập số điện thoại'
                prefix={<PhoneOutlined className='text-gray-400' />}
                required
                error={errors.phone?.message}
              />
            )}
          />
        </div>
        {/* Mật khẩu và Xác nhận mật khẩu */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Controller
            control={control}
            name='password'
            render={({ field }) => (
              <Input
                {...field}
                type='password'
                label='Mật khẩu'
                placeholder='Nhập mật khẩu'
                prefix={<LockOutlined className='text-gray-400' />}
                required
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <Input
                {...field}
                type='password'
                label='Xác nhận mật khẩu'
                placeholder='Nhập lại mật khẩu'
                prefix={<LockOutlined className='text-gray-400' />}
                required
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </div>
        <Button
          type='submit'
          variant='primary'
          width='full'
          isLoading={isSubmitting || isLoading}
          disabled={usernameCheck.error || emailCheck.error || usernameCheck.isChecking || emailCheck.isChecking}
        >
          Đăng ký
        </Button>
        <div className='text-center text-sm'>
          Đã có tài khoản?{' '}
          <Link to='/login' className='text-primaryColor hover:underline'>
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
