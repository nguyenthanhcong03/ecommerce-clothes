import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Input from '../common/Input';
import Button from '../common/Button/Button';
import { Select } from 'antd';
import { Option } from 'antd/es/mentions';

// Định nghĩa schema validation với yup
const schema = yup.object({
  username: yup.string().required('Tên người dùng là bắt buộc').min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
});

const InputFormExample = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    // Xử lý form ở đây, ví dụ gọi API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập API call
    alert('Form submitted successfully!');
  };

  return (
    <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
      <h2 className='mb-6 text-center text-2xl font-bold'>Đăng ký tài khoản</h2>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Input
          name='username'
          control={control}
          label='Tên người dùng'
          placeholder='Nhập tên người dùng'
          required
          prefix={<UserOutlined className='text-gray-400' />}
        />

        <Input
          name='email'
          control={control}
          label='Email'
          type='email'
          placeholder='example@email.com'
          required
          prefix={<MailOutlined className='text-gray-400' />}
        />

        <Input
          name='password'
          control={control}
          label='Mật khẩu'
          type='password'
          placeholder='Nhập mật khẩu'
          required
          prefix={<LockOutlined className='text-gray-400' />}
        />

        <Input
          name='confirmPassword'
          control={control}
          label='Xác nhận mật khẩu'
          type='password'
          placeholder='Nhập lại mật khẩu'
          required
          prefix={<LockOutlined className='text-gray-400' />}
        />

        <Button variant='secondary'>Đăng ksy</Button>
        <Controller
          name='gender'
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value || undefined}
              placeholder='Chọn giới tính'
              allowClear
              onChange={(value) => field.onChange(value)} // bắt buộc!
            >
              <Option value='male'>Nam</Option>
              <Option value='female'>Nữ</Option>
            </Select>
          )}
        />
      </form>
    </div>
  );
};

export default InputFormExample;
