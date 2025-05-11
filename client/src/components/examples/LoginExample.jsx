import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import useAuth from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const LoginExample = () => {
  const { login, isLoading, error, clearAuthError } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { username, password, remember } = values;
    try {
      await login(username, password, remember);
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  // Xóa lỗi khi form thay đổi
  const handleValuesChange = () => {
    if (error) clearAuthError();
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gray-100 px-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        <h2 className='mb-6 text-center text-2xl font-bold text-gray-800'>Đăng nhập</h2>

        {error && (
          <div className='mb-4 rounded-md bg-red-50 p-3 text-red-500'>
            <p>{error}</p>
          </div>
        )}

        <Form
          form={form}
          name='login'
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          autoComplete='off'
          layout='vertical'
        >
          <Form.Item name='username' rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email!' }]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Tên đăng nhập hoặc email'
              size='large'
            />
          </Form.Item>

          <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password
              prefix={<LockOutlined className='site-form-item-icon' />}
              placeholder='Mật khẩu'
              size='large'
            />
          </Form.Item>

          <Form.Item>
            <div className='flex items-center justify-between'>
              <Form.Item name='remember' valuePropName='checked' noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <Link to='/forgot-password' className='text-sm text-blue-600 hover:underline'>
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={isLoading} className='w-full' size='large'>
              Đăng nhập
            </Button>
          </Form.Item>

          <div className='text-center'>
            <span className='text-gray-600'>Chưa có tài khoản? </span>
            <Link to='/register' className='text-blue-600 hover:underline'>
              Đăng ký ngay
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginExample;
