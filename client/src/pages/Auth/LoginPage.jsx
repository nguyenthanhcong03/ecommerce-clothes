import { doLoginAction } from '@/redux/features/account/accountSlice';
import { login } from '@/services/authService';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button/Button';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

// Định nghĩa schema validation với yup
const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  password: yup.string().required('Mật khẩu là bắt buộc')
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const dispatch = useDispatch();

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

    setIsSubmit(true);
    try {
      const res = await login(username, password);
      setIsSubmit(false);

      if (res?.accessToken && res?.user) {
        dispatch(doLoginAction(res));
        navigate('/');
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      setIsSubmit(false);
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
            <Input
              name='username'
              control={control}
              label='Tên đăng nhập'
              placeholder='Nhập tên đăng nhập'
              prefix={<UserOutlined className='text-gray-400' />}
              required
              rules={{ required: 'Tên đăng nhập là bắt buộc' }}
            />

            <Input
              name='password'
              control={control}
              label='Mật khẩu'
              type='password'
              placeholder='Nhập mật khẩu'
              prefix={<LockOutlined className='text-gray-400' />}
              required
              rules={{ required: 'Mật khẩu là bắt buộc' }}
            />

            <div className='flex justify-between text-sm'>
              <div className='flex items-center'>
                <input type='checkbox' id='remember' className='mr-2 h-4 w-4' />
                <label htmlFor='remember'>Nhớ mật khẩu</label>
              </div>
              <a href='/forgot-password' className='text-primaryColor hover:underline'>
                Quên mật khẩu?
              </a>
            </div>

            <Button type='submit' variant='primary' width='full' isLoading={isSubmitting || isSubmit}>
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
