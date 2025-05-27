import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import { registerUser, clearSuccessMessage } from '@/store/slices/accountSlice';
import { checkUsernameExists, checkEmailExists } from '@/services/authService';
import { toast } from 'react-toastify';
import useDebounce from '@/hooks/useDebounce';

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
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
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
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  // Kiểm tra username khi người dùng nhập
  useEffect(() => {
    const checkUsername = async () => {
      if (debouncedUsername && debouncedUsername.length >= 3) {
        setUsernameCheck({ isChecking: true, message: '', error: false });

        try {
          const result = await checkUsernameExists(debouncedUsername);

          if (result.success) {
            setUsernameCheck({
              isChecking: false,
              message: result.message,
              error: result.exists
            });
            setError('username', {
              type: 'manual',
              message: result.exists ? 'Tên đăng nhập đã tồn tại' : ''
            });
          }
        } catch {
          setUsernameCheck({
            isChecking: false,
            message: 'Không thể kiểm tra username',
            error: false
          });
        }
      } else if (debouncedUsername === '') {
        setUsernameCheck({ isChecking: false, message: '', error: false });
      }
    };

    checkUsername();
  }, [debouncedUsername, setError]);

  // Kiểm tra email khi người dùng nhập
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (debouncedEmail && emailRegex.test(debouncedEmail)) {
        setEmailCheck({ isChecking: true, message: '', error: false });

        try {
          const result = await checkEmailExists(debouncedEmail);

          if (result.success) {
            setEmailCheck({
              isChecking: false,
              message: result.message,
              error: result.exists
            });
            setError('email', {
              type: 'manual',
              message: result.exists ? 'Email đã tồn tại' : ''
            });
          }
        } catch {
          setEmailCheck({
            isChecking: false,
            message: 'Không thể kiểm tra email',
            error: false
          });
        }
      } else if (debouncedEmail === '') {
        setEmailCheck({ isChecking: false, message: '', error: false });
      }
    };

    checkEmail();
  }, [debouncedEmail, setError]);
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
  };
  return (
    <div className='px-4 pt-24 sm:px-6 lg:px-8'>
      <div className='flex min-h-full items-center justify-center'>
        <div className='w-full max-w-2xl'>
          <div className='text-center'>
            <div className='relative mx-auto mb-8'>
              {/* Logo/Brand Mark */}
              <div>{/* <img src={Logo} alt='' /> */}</div>
            </div>

            <div className='space-y-4'>
              <h1 className='relative text-5xl font-black tracking-tight text-black'>
                <span className='bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent'>
                  OUTFITORY
                </span>
                <span className='ml-2 font-light text-gray-600'>FASHION</span>
              </h1>

              <div className='relative'>
                <h2 className='relative text-2xl font-light italic text-gray-700'>
                  &ldquo;Tạo tài khoản để trải nghiệm phong cách riêng&rdquo;
                </h2>
                <div className='absolute -left-4 -right-4 top-1/2 h-px -translate-y-1/2 transform bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50'></div>
              </div>

              {/* Decorative elements */}
              <div className='mt-6 flex items-center justify-center space-x-4'>
                <div className='h-px w-8 bg-gradient-to-r from-transparent to-black'></div>
                <div className='h-2 w-2 rounded-full bg-black'></div>
                <div className='h-px w-8 bg-gradient-to-l from-transparent to-black'></div>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center py-8'>
            <div className='w-full max-w-2xl rounded-lg bg-white p-8 shadow-sm'>
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
                </div>{' '}
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
                  {' '}
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
                </div>{' '}
                <Button
                  type='submit'
                  variant='primary'
                  width='full'
                  isLoading={isSubmitting || isLoading}
                  disabled={
                    usernameCheck.error || emailCheck.error || usernameCheck.isChecking || emailCheck.isChecking
                  }
                >
                  Đăng ký
                </Button>{' '}
                <div className='text-center text-sm'>
                  Đã có tài khoản?{' '}
                  <Link to='/login' className='text-primaryColor hover:underline'>
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
