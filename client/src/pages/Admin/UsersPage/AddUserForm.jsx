import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button, Select, Switch, Card, Row, Col, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOpenForm, setSelectedUser, updateUserById } from '../../../redux/features/user/userSlice';
import axiosClient from '../../../services/axiosClient';

const { Option } = Select;

// Schema validation với Yup
// const addressSchema = yup.object({
//   type: yup.string().oneOf(['home', 'work', 'billing', 'shipping']).required('Loại địa chỉ là bắt buộc'),
//   street: yup.string().required('Đường là bắt buộc'),
//   city: yup.string().required('Thành phố là bắt buộc'),
//   state: yup.string(),
//   country: yup.string().required('Quốc gia là bắt buộc'),
//   postalCode: yup.string().required('Mã bưu điện là bắt buộc'),
//   isDefault: yup.boolean().default(false)
// });

// const preferencesSchema = yup.object({
//   language: yup.string().default('en'),
//   currency: yup.string().default('USD'),
//   notifications: yup.boolean().default(true)
// });

const userSchema = yup.object({
  // email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  // password: yup.string().min(6, 'Mật khẩu phải dài ít nhất 6 ký tự').optional(), // Không bắt buộc khi chỉnh sửa
  // username: yup.string().required('Tên người dùng là bắt buộc'),
  // firstName: yup.string().required('Tên là bắt buộc'),
  // lastName: yup.string().required('Họ là bắt buộc'),
  // phone: yup
  //   .string()
  //   .matches(/^[0-9]{10,15}$/, 'Số điện thoại không hợp lệ')
  //   .optional(),
  // address: yup.array().of(addressSchema).min(1, 'Phải có ít nhất một địa chỉ'),
  // role: yup.string().oneOf(['customer', 'admin']).default('customer'),
  // status: yup.string().oneOf(['active', 'inactive', 'banned']).default('active'),
  // preferences: preferencesSchema
});

const AddUserForm = () => {
  const dispatch = useDispatch();
  const { users, status, error, page, pages, isOpenForm, selectedUser } = useSelector((state) => state.user);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      address: [{ type: 'home', street: '', city: '', country: '', postalCode: '', isDefault: false }],
      preferences: { language: 'en', currency: 'USD', notifications: true },
      role: 'customer',
      status: 'active'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'address'
  });

  // Điền dữ liệu khi selectedUser thay đổi (chế độ chỉnh sửa)
  useEffect(() => {
    if (selectedUser) {
      reset({
        email: selectedUser.email || '',
        password: selectedUser.password || '',
        // password: '', // Để trống vì không hiển thị mật khẩu cũ
        username: selectedUser.username || '',
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        phone: selectedUser.phone || '',
        address:
          selectedUser.address.length > 0
            ? selectedUser.address
            : [{ type: 'home', street: '', city: '', country: '', postalCode: '', isDefault: false }],
        role: selectedUser.role || 'customer',
        status: selectedUser.status || 'active',
        preferences: selectedUser.preferences || { language: 'en', currency: 'USD', notifications: true }
      });
    }
  }, [selectedUser, reset]);

  const onSubmit = async (data) => {
    try {
      if (selectedUser) {
        if (data.password === selectedUser.password) {
          delete data.password;
        }
        console.log('data', data);

        const response = await dispatch(updateUserById({ userId: selectedUser._id, payload: data }));
        // Chế độ chỉnh sửa: Gửi PATCH hoặc PUT request
        // const response = await axiosClient.put(`http://localhost:5000/api/user/${selectedUser._id}`, data);
        console.log('User updated:', response);
        alert('Cập nhật người dùng thành công!');
      } else {
        // // Chế độ thêm mới: Gửi POST request
        // const response = await axios.post('http://localhost:3000/api/users', data);
        // console.log('User created:', response.data);
        // alert('Thêm người dùng thành công!');
      }
      dispatch(setIsOpenForm(false)); // Đóng modal sau khi thành công
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi xử lý người dùng.');
    }
  };

  return (
    <Modal
      width={800}
      open={isOpenForm}
      title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      okText={selectedUser ? 'Cập nhật' : 'Tạo mới'}
      cancelText='Hủy'
      okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
      onCancel={() => {
        dispatch(setIsOpenForm(false));
        dispatch(setSelectedUser(null));
      }}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
    >
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Email' help={errors.email?.message} validateStatus={errors.email ? 'error' : ''}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập email' />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Mật khẩu' help={errors.password?.message} validateStatus={errors.password ? 'error' : ''}>
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <Input.Password {...field} placeholder={selectedUser ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label='Tên người dùng'
              help={errors.username?.message}
              validateStatus={errors.username ? 'error' : ''}
            >
              <Controller
                name='username'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập tên người dùng' />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='Tên' help={errors.firstName?.message} validateStatus={errors.firstName ? 'error' : ''}>
              <Controller
                name='firstName'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập tên' />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='Họ' help={errors.lastName?.message} validateStatus={errors.lastName ? 'error' : ''}>
              <Controller
                name='lastName'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập họ' />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Số điện thoại' help={errors.phone?.message} validateStatus={errors.phone ? 'error' : ''}>
          <Controller
            name='phone'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập số điện thoại' />}
          />
        </Form.Item>

        {/* Address */}
        <Form.Item label='Địa chỉ' help={errors.address?.message} validateStatus={errors.address ? 'error' : ''}>
          {fields.map((field, index) => (
            <Card key={field.id} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label='Loại địa chỉ' help={errors.address?.[index]?.type?.message}>
                    <Controller
                      name={`address[${index}].type`}
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder='Chọn loại'>
                          <Option value='home'>Nhà riêng</Option>
                          <Option value='work'>Công việc</Option>
                          <Option value='billing'>Thanh toán</Option>
                          <Option value='shipping'>Vận chuyển</Option>
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label='Đường' help={errors.address?.[index]?.street?.message}>
                    <Controller
                      name={`address[${index}].street`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập tên đường' />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label='Thành phố' help={errors.address?.[index]?.city?.message}>
                    <Controller
                      name={`address[${index}].city`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập thành phố' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Quốc gia' help={errors.address?.[index]?.country?.message}>
                    <Controller
                      name={`address[${index}].country`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập quốc gia' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Mã bưu điện' help={errors.address?.[index]?.postalCode?.message}>
                    <Controller
                      name={`address[${index}].postalCode`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập mã bưu điện' />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label='Địa chỉ mặc định'>
                <Controller
                  name={`address[${index}].isDefault`}
                  control={control}
                  render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
                />
              </Form.Item>
              {fields.length > 1 && (
                <Button type='link' danger onClick={() => remove(index)}>
                  Xóa địa chỉ
                </Button>
              )}
            </Card>
          ))}
          <Button
            type='dashed'
            onClick={() =>
              append({ type: 'home', street: '', city: '', country: '', postalCode: '', isDefault: false })
            }
          >
            Thêm địa chỉ
          </Button>
        </Form.Item>

        {/* Preferences */}
        <Form.Item label='Tùy chọn'>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label='Ngôn ngữ'>
                <Controller
                  name='preferences.language'
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <Option value='en'>English</Option>
                      <Option value='vi'>Tiếng Việt</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Thông báo'>
                <Controller
                  name='preferences.notifications'
                  control={control}
                  render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Vai trò'>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <Option value='customer'>Khách hàng</Option>
                    <Option value='admin'>Quản trị viên</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Trạng thái'>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <Option value='active'>Hoạt động</Option>
                    <Option value='inactive'>Không hoạt động</Option>
                    <Option value='banned'>Bị cấm</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddUserForm;
