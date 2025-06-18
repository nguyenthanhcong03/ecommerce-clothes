import { userAdminSchema } from '@/utils/validate/userValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { unwrapResult } from '@reduxjs/toolkit';
import { Col, Form, Input, message, Modal, Row, Select, Spin } from 'antd';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import propTypes from 'prop-types';
import { createUserByAdmin, updateUserAdmin } from '@/store/slices/adminUserSlice';

const { Option } = Select;

const UserForm = ({ selectedUser, onClose }) => {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.adminUser);
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
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
      isBlocked: false,
      gender: '',
      password: ''
    }
  });

  const handleAddUser = async (userData) => {
    try {
      const result = await dispatch(createUserByAdmin(userData));
      unwrapResult(result);
      message.success('Thêm người dùng thành công!');
      onClose();
    } catch (error) {
      // Hiển thị thông báo lỗi từ server
      message.error(error.message || 'Thêm người dùng thất bại!');

      // Xử lý lỗi từ server (các trường lỗi)
      if (error?.errors) {
        error.errors.forEach(({ field, message }) => {
          setError(field, { type: 'server', message });
        });
      }
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const result = await dispatch(updateUserAdmin({ userId, userData }));
      unwrapResult(result);
      message.success('Cập nhật người dùng thành công!');
      onClose();
    } catch (error) {
      console.log('error', error);
      // Hiển thị thông báo lỗi từ server
      message.error(error.message || 'Cập nhật người dùng thất bại!');

      // Xử lý lỗi từ server (các trường lỗi)
      if (error?.errors) {
        error.errors.forEach(({ field, message }) => {
          console.log('đã set lỗi', field, message);
          setError(field, { type: 'server', message });
        });
      }
    }
  };

  // Set default values when user data is loaded
  useEffect(() => {
    if (selectedUser) {
      console.log('selectedUser', selectedUser);
      reset({
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        email: selectedUser.email || '',
        username: selectedUser.username || '',
        phone: selectedUser.phone || '',
        role: selectedUser.role || 'customer',
        isBlocked: selectedUser.isBlocked || false,
        gender: selectedUser.gender || ''
      });
    }
  }, [selectedUser, reset]);

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' }
  ];

  const genderOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
  ];

  const onSubmit = (data) => {
    try {
      // Xóa các lỗi cũ trước khi gửi form
      clearErrors();

      if (selectedUser) {
        handleUpdateUser(selectedUser._id, data);
      } else {
        handleAddUser(data);
      }
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
      width={700}
      title={selectedUser ? `Chỉnh sửa người dùng: ${selectedUser.username}` : 'Thêm người dùng mới'}
      okText={selectedUser ? 'Cập nhật' : 'Tạo mới'}
      cancelText='Hủy'
      okButtonProps={{
        autoFocus: true,
        htmlType: 'submit',
        loading: actionLoading,
        disabled: !isDirty
      }}
      onCancel={handleCancel}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
      maskClosable={false}
    >
      <Spin spinning={actionLoading}>
        <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Tên'
                validateStatus={errors.firstName ? 'error' : ''}
                help={errors.firstName?.message}
                required
              >
                <Controller
                  name='firstName'
                  control={control}
                  render={({ field }) => <Input placeholder='Nhập tên' {...field} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label='Họ'
                validateStatus={errors.lastName ? 'error' : ''}
                help={errors.lastName?.message}
                required
              >
                <Controller
                  name='lastName'
                  control={control}
                  render={({ field }) => <Input placeholder='Nhập họ' {...field} />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Email'
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
                required
              >
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => <Input placeholder='Nhập địa chỉ email' {...field} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label='Tên đăng nhập'
                validateStatus={errors.username ? 'error' : ''}
                help={errors.username?.message}
                required
              >
                <Controller
                  name='username'
                  control={control}
                  render={({ field }) => <Input placeholder='Nhập tên đăng nhập' {...field} />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Số điện thoại'
                validateStatus={errors.phone ? 'error' : ''}
                help={errors.phone?.message}
                required
              >
                <Controller
                  name='phone'
                  control={control}
                  render={({ field }) => <Input placeholder='Nhập số điện thoại' {...field} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label='Giới tính' validateStatus={errors.gender ? 'error' : ''} help={errors.gender?.message}>
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || undefined}
                      onChange={(value) => {
                        field.onChange(value === undefined ? null : value);
                      }}
                      placeholder='Chọn giới tính'
                      allowClear
                    >
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
              <Form.Item
                label='Vai trò'
                validateStatus={errors.role ? 'error' : ''}
                help={errors.role?.message}
                required
              >
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Select placeholder='Chọn vai trò' {...field}>
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
          </Row>

          {!selectedUser && (
            <Form.Item
              label='Mật khẩu mới (để trống nếu không thay đổi)'
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
              required={selectedUser ? false : true}
            >
              <Controller
                name='password'
                control={control}
                render={({ field }) => <Input.Password placeholder='Nhập mật khẩu' {...field} />}
              />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

UserForm.propTypes = {
  selectedUser: propTypes.object,
  onClose: propTypes.func.isRequired
};

export default UserForm;
