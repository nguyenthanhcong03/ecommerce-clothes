import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { loginUser, clearError } from '@/store/slices/accountSlice';
import { toast } from 'react-toastify';

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

  // Lấy state từ Redux store
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.account);

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

  // Hiệu ứng điều hướng sau khi đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated) {
      // Chuyển hướng đến trang trước đó hoặc trang chủ
      const returnPath = location.state?.from || '/';
      navigate(returnPath, { replace: true });
      toast.success('Đăng nhập thành công!');
    }
  }, [isAuthenticated, navigate, location]);

  // Hiệu ứng hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Xóa lỗi sau khi đã hiển thị
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Xử lý khi submit form
  const onSubmit = async (data) => {
    const { username, password } = data;

    try {
      // Dispatch action đăng nhập với cấu trúc object đúng và thông tin remember me
      dispatch(loginUser({ username, password, rememberMe }));
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
  };

  return (
    <div className='w-full pt-[60px] lg:pt-[80px]'>
      <div className='flex h-[50px] max-h-[100px] w-full items-center justify-center bg-[#FAFAFA] sm:h-[60px] md:h-[80px] lg:h-[90px] xl:h-[100px]'>
        <h1 className='text-[24px] font-medium'>ĐĂNG NHẬP</h1>
      </div>

      <div className='flex items-center justify-center bg-gray-100 py-8'>
        <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
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
                  type='password'
                  label='Mật khẩu'
                  placeholder='Nhập mật khẩu'
                  prefix={<LockOutlined className='text-gray-400' />}
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

            <Button type='submit' variant='primary' width='full' isLoading={isLoading || isSubmitting}>
              Đăng nhập
            </Button>

            <div className='text-center text-sm'>
              Chưa có tài khoản?{' '}
              <a href='/register' className='text-primaryColor hover:underline'>
                Đăng ký ngay
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
