import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { clearError, clearSuccessMessage, updateUserPassword } from '@/store/slices/accountSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

// Validation schema với Yup
const changePasswordSchema = yup.object().shape({
  // oldPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại').min(1, 'Mật khẩu hiện tại không được để trống'),
  // newPassword: yup
  //   .string()
  //   .required('Vui lòng nhập mật khẩu mới')
  //   .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
  //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
  //   .notOneOf([yup.ref('oldPassword')], 'Mật khẩu mới không được trùng mật khẩu hiện tại')
  //   .test('not-same-as-current', 'Mật khẩu mới không được trùng mật khẩu hiện tại', function (value) {
  //     return value !== this.parent.oldPassword;
  //   }),
  // confirmPassword: yup
  //   .string()
  //   .required('Vui lòng xác nhận mật khẩu mới')
  //   .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
  //   .test('match-new-password', 'Mật khẩu xác nhận không khớp', function (value) {
  //     return value === this.parent.newPassword;
  //   })
});

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error, successMessage } = useSelector((state) => state.account);

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    trigger,
    setError,
    control
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const oldPassword = watch('oldPassword');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (newPassword && confirmPassword) {
      trigger('confirmPassword');
    }
    if (oldPassword && newPassword) {
      trigger('newPassword');
    }
  }, [newPassword, confirmPassword, oldPassword, trigger]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onSubmit = (data) => {
    dispatch(
      updateUserPassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      })
    )
      .unwrap()
      .then((response) => {
        console.log('Password updated successfully:', response);
      })
      .catch((error) => {
        setError('oldPassword', {
          type: 'manual',
          message: error || 'Đổi mật khẩu thất bại'
        });
      });
    console.log('data', data);
  };

  const handleResetForm = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, text: 'Yếu', color: 'text-red-600 bg-red-100' };
    if (score <= 4) return { score, text: 'Trung bình', color: 'text-yellow-600 bg-yellow-100' };
    return { score, text: 'Mạnh', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className='mx-auto max-w-7xl bg-white p-4'>
      {/* Header */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center space-x-4'>
          <div className='rounded-lg bg-blue-100 p-2'>
            <Shield className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Thay đổi mật khẩu</h1>
            <p className='hidden text-base text-gray-600 md:block'>
              Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia sẻ với người khác.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center space-x-2'>
            <AlertCircle className='h-4 w-4 text-red-600' />
            <span className='text-sm font-medium text-red-700'>{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className='mb-6 rounded-lg border border-green-200 bg-green-50 p-4'>
          <div className='flex items-center space-x-2'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <span className='text-sm font-medium text-green-700'>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className='rounded-sm border border-gray-200 bg-white p-6 shadow-sm'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Mật khẩu hiện tại */}
          <div className='space-y-2'>
            <Input
              {...register('oldPassword')}
              name='oldPassword'
              label='Mật khẩu hiện tại'
              type={showPasswords.oldPassword ? 'text' : 'password'}
              placeholder='Nhập mật khẩu hiện tại'
              error={errors.oldPassword}
              prefix={<Lock className='h-4 w-4 text-gray-400' />}
              suffix={
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className='p-1 transition-colors hover:text-gray-600'
                >
                  {showPasswords.oldPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              }
            />
          </div>

          {/* Mật khẩu mới */}
          <div className='space-y-2'>
            <Input
              {...register('newPassword')}
              name='newPassword'
              label='Mật khẩu mới'
              type={showPasswords.newPassword ? 'text' : 'password'}
              placeholder='Nhập mật khẩu mới'
              error={errors.newPassword}
              prefix={<Lock className='h-4 w-4 text-gray-400' />}
              suffix={
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className='p-1 transition-colors hover:text-gray-600'
                >
                  {showPasswords.newPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              }
            />
            {newPassword && (
              <div className='mt-2'>
                <div className='flex items-center space-x-2'>
                  <div className='h-2 flex-1 rounded-full bg-gray-200'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrength(newPassword).score <= 2
                          ? 'bg-red-500'
                          : getPasswordStrength(newPassword).score <= 4
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${(getPasswordStrength(newPassword).score / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${getPasswordStrength(newPassword).color}`}>
                    {getPasswordStrength(newPassword).text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className='space-y-2'>
            <Input
              {...register('confirmPassword')}
              name='confirmPassword'
              label='Xác nhận mật khẩu mới'
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              placeholder='Nhập mật khẩu mới'
              error={errors.confirmPassword}
              prefix={<Lock className='h-4 w-4 text-gray-400' />}
              suffix={
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className='p-1 transition-colors hover:text-gray-600'
                >
                  {showPasswords.confirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              }
            />
          </div>
          {/* Các yêu cầu của mật khẩu */}
          <div className='rounded-sm border border-blue-200 bg-blue-50 p-4'>
            <h3 className='mb-2 text-sm font-medium text-blue-900'>Yêu cầu mật khẩu:</h3>
            <ul className='space-y-1 text-sm text-blue-700'>
              <li className='flex items-center space-x-2'>
                <CheckCircle
                  className={`h-4 w-4 ${watch('newPassword')?.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}
                />
                <span>Ít nhất 6 ký tự</span>
              </li>
              <li className='flex items-center space-x-2'>
                <CheckCircle
                  className={`h-4 w-4 ${/[a-z]/.test(watch('newPassword') || '') ? 'text-green-500' : 'text-gray-400'}`}
                />
                <span>Chứa ít nhất 1 chữ thường</span>
              </li>
              <li className='flex items-center space-x-2'>
                <CheckCircle
                  className={`h-4 w-4 ${/[A-Z]/.test(watch('newPassword') || '') ? 'text-green-500' : 'text-gray-400'}`}
                />
                <span>Chứa ít nhất 1 chữ hoa</span>
              </li>
              <li className='flex items-center space-x-2'>
                <CheckCircle
                  className={`h-4 w-4 ${/\d/.test(watch('newPassword') || '') ? 'text-green-500' : 'text-gray-400'}`}
                />
                <span>Chứa ít nhất 1 số</span>
              </li>
            </ul>
          </div>
          {/* Buttons */}
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              type='submit'
              disabled={!isValid || !isDirty}
              isLoading={isLoading}
              variant='primary'
              width='full'
              className='sm:flex-1'
            >
              Cập nhật mật khẩu
            </Button>

            <Button type='button' onClick={handleResetForm} variant='secondary' className='sm:w-auto'>
              Làm mới
            </Button>
          </div>
        </form>
      </div>

      {/* Các mẹo bảo mật */}
      <div className='mt-8 rounded-sm bg-gray-50 p-6'>
        <h3 className='mb-3 flex items-center space-x-2 text-lg font-medium text-gray-900'>
          <Shield className='h-4 w-4 text-blue-600' />
          <span>Mẹo bảo mật</span>
        </h3>
        <ul className='space-y-2 text-sm text-gray-600'>
          <li className='flex items-start space-x-2'>
            <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
            <span>Thay đổi mật khẩu thường xuyên (3-6 tháng một lần)</span>
          </li>
          <li className='flex items-start space-x-2'>
            <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
            <span>Không sử dụng chung mật khẩu với các tài khoản khác</span>
          </li>
          <li className='flex items-start space-x-2'>
            <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
            <span>Đăng xuất khỏi thiết bị công cộng sau khi sử dụng</span>
          </li>
          <li className='flex items-start space-x-2'>
            <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
            <span>Kích hoạt xác thực hai yếu tố nếu có thể</span>
          </li>
          <li className='flex items-start space-x-2'>
            <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
            <span>Sử dụng trình quản lý mật khẩu để tạo mật khẩu mạnh</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
