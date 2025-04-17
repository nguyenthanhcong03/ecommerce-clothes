import Input from '@/components/common/Input/Input2';
import { doLoginAction } from '@/redux/features/account/accountSlice';
import { login } from '@/services/authService';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

// Định nghĩa schema validation với yup
const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  password: yup.string().required('Mật khẩu là bắt buộc')
  // .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  // .matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  //   'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường, 1 số và 1 ký tự đặc biệt'
  // )
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);

  const dispatch = useDispatch();

  const onFinish = async (values) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await login(username, password);
    setIsSubmit(false);
    if (res?.data) {
      // localStorage.setItem('access_token', res.data.access_token);
      dispatch(doLoginAction(res.data.user));
      // message.success('Đăng nhập tài khoản thành công.');
      navigate('/');
    } else {
      // notification.error({
      //   message: "Có lỗi xảy ra."
      //   description:res.message && Array.isArray(res.message) ? res.message[0] : res.message[1]
      //   duration: 5
      // })
    }
  };

  const {
    register,
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
    const res = await login(username, password);
    setIsSubmit(false);
    if (res?.user) {
      console.log(res?.user);
      // localStorage.setItem('accessToken', res.accessToken);
      dispatch(doLoginAction(res));
      // message.success('Đăng nhập tài khoản thành công.');
      navigate('/');
    } else {
      // notification.error({
      //   message: "Có lỗi xảy ra."
      //   description:res.message && Array.isArray(res.message) ? res.message[0] : res.message[1]
      //   duration: 5
      // })
    }
  };

  return (
    <div className='w-full pt-[60px] lg:pt-[80px]'>
      <div className='flex h-[50px] max-h-[100px] w-full items-center justify-center bg-[#FAFAFA] sm:h-[60px] md:h-[80px] lg:h-[90px] xl:h-[100px]'>
        <h1 className='text-[24px]'>LOGIN</h1>
      </div>
      <div className='flex items-center justify-center bg-gray-100'>
        <form onSubmit={handleSubmit(onSubmit)} className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
          <h2 className='mb-6 text-center text-2xl font-bold text-gray-800'>Đăng nhập</h2>

          <Input
            label='Tên đăng nhập'
            id='username'
            name='username'
            register={register}
            error={errors.username}
            placeholder='Nhập tên đăng nhập'
            // className='mb-4'
          />

          <Input
            label='Mật khẩu'
            id='password'
            name='password'
            type='password'
            register={register}
            error={errors.password}
            placeholder='Nhập mật khẩu'
            // className='mb-6'
          />

          <button
            type='submit'
            disabled={isSubmitting}
            className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''} `}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
