import { createCoupon, updateCoupon } from '@/store/slices/adminCouponSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Switch, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// Schema validation với Yup
const couponSchema = yup.object({
  code: yup.string().required('Vui lòng nhập mã giảm giá').min(3, 'Mã giảm giá phải có ít nhất 3 ký tự').uppercase(),
  discountType: yup
    .string()
    .required('Vui lòng chọn loại giảm giá')
    .oneOf(['percentage', 'fixed'], 'Loại giảm giá không hợp lệ'),
  discountValue: yup
    .number()
    .required('Vui lòng nhập giá trị giảm giá')
    .positive('Giá trị phải là số dương')
    .when('discountType', {
      is: 'percentage',
      then: (schema) => schema.max(100, 'Phần trăm giảm giá không thể quá 100%')
    }),
  minOrderValue: yup.number().min(0, 'Giá trị đơn hàng tối thiểu không thể âm').default(0),
  maxDiscount: yup.number().min(0, 'Giá trị giảm giá tối đa không thể âm').default(0),
  startDate: yup.date().required('Vui lòng chọn ngày bắt đầu'),
  endDate: yup
    .date()
    .required('Vui lòng chọn ngày kết thúc')
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  usageLimit: yup.number().min(0, 'Giới hạn sử dụng không thể âm').default(0),
  description: yup.string(),
  isActive: yup.boolean().default(true)
});

const CouponForm = ({ isOpenForm, onClose, selectedCoupon }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.coupon);
  const [couponType, setCouponType] = useState('percentage');

  // Setup react-hook-form với yup resolver
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(couponSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      startDate: null,
      endDate: null,
      description: '',
      usageLimit: 0,
      isActive: true
    }
  });

  // Theo dõi thay đổi của trường discountType để cập nhật UI
  const watchType = watch('discountType');

  useEffect(() => {
    setCouponType(watchType);
  }, [watchType]);

  // Reset form khi mở Modal và load dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (isOpenForm) {
      if (selectedCoupon) {
        reset({
          code: selectedCoupon.code,
          discountType: selectedCoupon.discountType,
          discountValue: selectedCoupon.discountValue,
          minOrderValue: selectedCoupon.minOrderValue,
          maxDiscount: selectedCoupon.maxDiscount,
          startDate: selectedCoupon.startDate,
          endDate: selectedCoupon.endDate,
          description: selectedCoupon.description || '',
          usageLimit: selectedCoupon.usageLimit || 0,
          isActive: selectedCoupon.isActive || true
        });

        setCouponType(selectedCoupon.discountType);
      } else {
        // Reset form khi thêm mới
        reset({
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          minOrderValue: 0,
          maxDiscount: 0,
          startDate: dayjs(),
          endDate: dayjs().add(30, 'day'),
          description: '',
          usageLimit: 0,
          isActive: true
        });
        setCouponType('percentage');
      }
    }
  }, [isOpenForm, selectedCoupon, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      // Format dates for API
      const submitData = {
        ...data,
        // Đảm bảo các trường số được chuyển thành số
        discountValue: Number(data.discountValue) || 0,
        minOrderValue: Number(data.minOrderValue) || 0,
        maxDiscount: Number(data.maxDiscount) || 0,
        usageLimit: Number(data.usageLimit) || 0
      };
      if (selectedCoupon) {
        await dispatch(updateCoupon({ id: selectedCoupon._id, updateData: submitData })).unwrap();
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await dispatch(createCoupon(submitData)).unwrap();
        message.success('Thêm mã giảm giá thành công');
      }
      onClose();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <Modal
      title={selectedCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
      open={isOpenForm}
      onOk={handleSubmit(onSubmit)}
      onCancel={onClose}
      confirmLoading={loading}
      okButtonProps={{
        autoFocus: true,
        htmlType: 'submit',
        loading: loading,
        disabled: !isDirty
      }}
      width={800}
      okText={selectedCoupon ? 'Cập nhật' : 'Thêm mã giảm giá'}
      cancelText='Hủy'
      maskClosable={false}
    >
      <Form layout='vertical'>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label='Mã giảm giá'
              validateStatus={errors.code ? 'error' : ''}
              help={errors.code?.message}
              tooltip='Mã này sẽ được chuyển tự động thành chữ hoa'
              required
            >
              <Controller
                name='code'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder='VD: SUMMER2025'
                    style={{ textTransform: 'uppercase' }}
                    disabled={loading}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label='Loại giảm giá'
              validateStatus={errors.discountType ? 'error' : ''}
              help={errors.discountType?.message}
              required
            >
              <Controller
                name='discountType'
                control={control}
                render={({ field }) => (
                  <Select {...field} disabled={loading}>
                    <Option value='percentage'>Phần trăm (%)</Option>
                    <Option value='fixed'>Số tiền cố định (VND)</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label='Giá trị giảm giá'
              validateStatus={errors.discountValue ? 'error' : ''}
              help={errors.discountValue?.message}
              required
            >
              <Controller
                name='discountValue'
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    addonAfter={couponType === 'percentage' ? '%' : 'đ'}
                    min={0}
                    max={couponType === 'percentage' ? 100 : 1000000000}
                    disabled={loading}
                    precision={couponType === 'percentage' ? 0 : 0}
                  />
                )}
              />
            </Form.Item>
          </Col>

          {couponType === 'percentage' && (
            <Col span={12}>
              <Form.Item
                label='Giảm giá tối đa'
                validateStatus={errors.maxDiscount ? 'error' : ''}
                help={errors.maxDiscount?.message}
                tooltip='Nhập 0 nếu không giới hạn'
              >
                <Controller
                  name='maxDiscount'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      addonAfter='đ'
                      min={0}
                      disabled={loading}
                      precision={0}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item
              label='Giá trị đơn hàng tối thiểu'
              validateStatus={errors.minOrderValue ? 'error' : ''}
              help={errors.minOrderValue?.message}
              tooltip='Nhập 0 nếu không yêu cầu giá trị tối thiểu'
            >
              <Controller
                name='minOrderValue'
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    addonAfter='đ'
                    min={0}
                    disabled={loading}
                    precision={0}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label='Giới hạn sử dụng'
              validateStatus={errors.usageLimit ? 'error' : ''}
              help={errors.usageLimit?.message}
              tooltip='Nhập 0 nếu không giới hạn số lần sử dụng'
            >
              <Controller
                name='usageLimit'
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} min={0} disabled={loading} precision={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label='Ngày bắt đầu'
              validateStatus={errors.startDate ? 'error' : ''}
              help={errors.startDate?.message}
              required
            >
              <Controller
                control={control}
                name='startDate'
                rules={{ required: 'Chọn ngày bắt đầu' }}
                render={({ field }) => (
                  <DatePicker
                    // showTime
                    placeholder='Chọn ngày bắt đầu'
                    {...field}
                    format='DD/MM/YYYY'
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label='Ngày kết thúc'
              validateStatus={errors.endDate ? 'error' : ''}
              help={errors.endDate?.message}
              required
            >
              <Controller
                control={control}
                name='endDate'
                rules={{ required: 'Chọn ngày kết thúc' }}
                render={({ field }) => (
                  <DatePicker
                    // showTime
                    placeholder='Chọn ngày kết thúc'
                    {...field}
                    format='DD/MM/YYYY'
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label='Mô tả'
              validateStatus={errors.description ? 'error' : ''}
              help={errors.description?.message}
            >
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextArea {...field} rows={3} placeholder='Mô tả chi tiết về mã giảm giá' disabled={loading} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Controller
                name='isActive'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className='flex items-center'>
                    <Switch
                      checked={value}
                      onChange={onChange}
                      // checkedChildren='Kích hoạt'
                      // unCheckedChildren='Vô hiệu hóa'
                      disabled={loading}
                    />
                    <Text style={{ marginLeft: 8 }}>{value ? 'Đang kích hoạt' : 'Vô hiệu hóa'}</Text>
                  </div>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

CouponForm.propTypes = {
  isOpenForm: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCoupon: PropTypes.object
};

export default CouponForm;
