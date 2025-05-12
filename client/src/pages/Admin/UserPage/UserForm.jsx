import React, { useCallback, useEffect } from 'react';
import { Form, Input, Select, Button, Row, Col, Spin, Card, Modal } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userAdminSchema } from '@/utils/userValidationSchema';
import { useDispatch } from 'react-redux';
import { updateUserAdmin } from '@/store/slices/userSlice';
import { createUserByAdmin } from '../../../store/slices/userSlice';

const { Option } = Select;

const UserForm = ({ user, onClose, loading }) => {
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(userAdminSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phone: '',
      role: 'customer',
      status: 'active',
      gender: '',
      newPassword: ''
    }
  });

  // Set default values when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        status: user.status || 'active',
        gender: user.gender || '',
        newPassword: ''
      });
    }
  }, [user, reset]);

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Banned' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
  ];

  const onSubmit = async (data) => {
    try {
      if (user && user._id) {
        // Chế độ cập nhật
        await dispatch(
          updateUserAdmin({
            userId: user._id,
            userData: data
          })
        ).unwrap();
      } else {
        // Chế độ tạo mới
        await dispatch(createUserByAdmin(data)).unwrap();
      }

      onClose();
    } catch (error) {
      console.error('Failed to process user form:', error);
    }
  };

  // Xử lý hủy form
  const handleCancel = useCallback(() => {
    if (isDirty) {
      // Hiện dialog xác nhận nếu có thay đổi chưa lưu
      Modal.confirm({
        title: 'Xác nhận hủy',
        content: 'Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.',
        okText: 'Hủy thay đổi',
        cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => {
          onClose(); // Đóng form
        }
      });
    } else {
      onClose(); // Đóng form mà không cần xác nhận
    }
  }, [isDirty, onClose]);

  return (
    <Modal
      open={true}
      title={user ? `Chỉnh sửa người dùng: ${user.username}` : 'Thêm người dùng mới'}
      onCancel={handleCancel}
      footer={null}
      width={700}
    >
      <Spin spinning={loading}>
        <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label='Tên' validateStatus={errors.firstName ? 'error' : ''} help={errors.firstName?.message}>
                <Controller name='firstName' control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label='Họ' validateStatus={errors.lastName ? 'error' : ''} help={errors.lastName?.message}>
                <Controller name='lastName' control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label='Email' validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                <Controller name='email' control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label='Tên đăng nhập'
                validateStatus={errors.username ? 'error' : ''}
                help={errors.username?.message}
              >
                <Controller name='username' control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Số điện thoại'
                validateStatus={errors.phone ? 'error' : ''}
                help={errors.phone?.message}
              >
                <Controller name='phone' control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label='Giới tính' validateStatus={errors.gender ? 'error' : ''} help={errors.gender?.message}>
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} placeholder='Chọn giới tính' allowClear>
                      {genderOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label='Vai trò' validateStatus={errors.role ? 'error' : ''} help={errors.role?.message}>
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      {roleOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label='Trạng thái' validateStatus={errors.status ? 'error' : ''} help={errors.status?.message}>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      {statusOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label='Mật khẩu mới (để trống nếu không thay đổi)'
            validateStatus={errors.newPassword ? 'error' : ''}
            help={errors.newPassword?.message}
          >
            <Controller name='newPassword' control={control} render={({ field }) => <Input.Password {...field} />} />
          </Form.Item>

          <Form.Item className='flex justify-end'>
            <Button type='default' onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              {user ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UserForm;
