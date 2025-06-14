import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import { loginUser } from '@/store/slices/accountSlice';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

// Định nghĩa schema validation với yup
const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });
  // Xử lý khi submit form
  const onSubmit = async (data) => {
    const { username, password } = data;

    try {
      await dispatch(loginUser({ username, password, rememberMe }))
        .unwrap()
        .then((result) => {
          toast.success('Đăng nhập thành công!');

          // Lấy thông tin user từ kết quả đăng nhập
          const userRole = result.user?.role || result.role;

          // Xác định đường dẫn điều hướng
          let redirectPath;

          // Nếu có trang trước đó (từ state), ưu tiên điều hướng về đó
          if (location.state?.from && location.state.from !== '/login') {
            redirectPath = location.state.from;
          } else {
            // Nếu không có trang trước đó, điều hướng theo role
            redirectPath = userRole === 'admin' ? '/admin' : '/';
          }

          navigate(redirectPath, { replace: true });
        })
        .catch((err) => {
          toast.error(err);
          console.error('Lỗi đăng nhập:', err);
        });
    } catch (error) {
      toast.error('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.error('Lỗi đăng nhập:', error);
    }
  };

  return (
    <div className='px-4 pt-24 sm:px-6 lg:px-8'>
      <div className='flex min-h-full items-center justify-center'>
        <div className='w-full max-w-md'>
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
                  &ldquo;Khám phá phong cách của riêng bạn cùng chúng tôi&rdquo;
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
            <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-sm'>
              <h2 className='mb-6 text-center text-2xl font-bold text-gray-800'>Đăng nhập tài khoản</h2>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <Controller
                  control={control}
                  name='username'
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Tên đăng nhập'
                      placeholder='Nhập tên đăng nhập'
                      prefix={<UserOutlined className='text-gray-400' />}
                      required
                      error={errors.username?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name='password'
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      label='Mật khẩu'
                      placeholder='Nhập mật khẩu'
                      prefix={<LockOutlined className='text-gray-400' />}
                      suffix={
                        showPassword ? (
                          <EyeOff onClick={() => setShowPassword(false)} cursor={'pointer'} width={18} />
                        ) : (
                          <Eye onClick={() => setShowPassword(true)} cursor={'pointer'} width={18} />
                        )
                      }
                      required
                      error={errors.password?.message}
                    />
                  )}
                />

                <div className='flex justify-between text-sm'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='remember'
                      className='mr-2 h-4 w-4'
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor='remember'>Nhớ mật khẩu</label>
                  </div>
                  <a href='/forgot-password' className='text-primaryColor hover:underline'>
                    Quên mật khẩu?
                  </a>
                </div>

                <Button type='submit' variant='primary' width='full' isLoading={isSubmitting}>
                  Đăng nhập
                </Button>

                <div className='text-center text-sm'>
                  Chưa có tài khoản?{' '}
                  <Link to='/register' className='text-primaryColor hover:underline'>
                    Đăng ký ngay
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

export default LoginPage;
