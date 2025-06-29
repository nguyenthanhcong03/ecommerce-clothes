import { orderStatuses } from '@/utils/helpers/orderStatusUtils';
import {
  CalendarOutlined,
  ClearOutlined,
  DownOutlined,
  FilterOutlined,
  SearchOutlined,
  UpOutlined
} from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, InputNumber, Row, Select, Space } from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderFilters = ({ onFilterChange, onResetFilter }) => {
  const [expanded, setExpanded] = useState(false);

  const headerStyle = {
    padding: '8px 16px',
    marginBottom: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    borderBottom: expanded ? '1px solid #f0f0f0' : 'none'
  };

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      status: null,
      paymentStatus: null,
      paymentMethod: null,
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null
    }
  });

  const handleFormSubmit = (data) => {
    onFilterChange(data);
  };

  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      status: null,
      paymentStatus: null,
      paymentMethod: null,
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null
    });

    // Gọi onResetFilter sau khi reset form
    onResetFilter();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={headerStyle} onClick={handleExpandClick}>
        <Space>
          <FilterOutlined />
          <span>Bộ lọc đơn hàng</span>
        </Space>
        <Button type='text' icon={expanded ? <UpOutlined /> : <DownOutlined />} />
      </div>
      {expanded && (
        <Form layout='vertical' onFinish={handleSubmit(handleFormSubmit)}>
          {/* Hàng 1: Trạng thái và Thanh toán */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Trạng thái đơn hàng'>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder='Chọn trạng thái đơn hàng'
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        field.onChange(value ?? null);
                      }}
                      value={field.value ?? undefined}
                      allowClear
                    >
                      {orderStatuses.map((status) => (
                        <Option key={status.value} value={status.value}>
                          {status.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Trạng thái thanh toán'>
                <Controller
                  name='paymentStatus'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder='Chọn trạng thái thanh toán'
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        field.onChange(value ?? null);
                      }}
                      value={field.value ?? undefined}
                      allowClear
                    >
                      <Option value={true}>Đã thanh toán</Option>
                      <Option value={false}>Chưa thanh toán</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Phương thức thanh toán'>
                <Controller
                  name='paymentMethod'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder='Chọn phương thức thanh toán'
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        field.onChange(value ?? null);
                      }}
                      value={field.value ?? undefined}
                      allowClear
                    >
                      <Option value='COD'>Thanh toán khi nhận hàng (COD)</Option>
                      <Option value='VNPay'>Thanh toán qua VNPay</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2: Thời gian và Giá trị */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label='Từ ngày'>
                <Controller
                  control={control}
                  name='startDate'
                  render={({ field }) => (
                    <DatePicker
                      placeholder='Chọn ngày bắt đầu'
                      {...field}
                      format='DD/MM/YYYY'
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date)}
                      style={{ width: '100%' }}
                      locale={locale}
                      suffixIcon={<CalendarOutlined />}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label='Đến ngày'>
                <Controller
                  control={control}
                  name='endDate'
                  render={({ field }) => (
                    <DatePicker
                      placeholder='Chọn ngày kết thúc'
                      {...field}
                      format='DD/MM/YYYY'
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date)}
                      style={{ width: '100%' }}
                      locale={locale}
                      suffixIcon={<CalendarOutlined />}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label='Giá trị tối thiểu'>
                <Controller
                  name='minAmount'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Nhập giá trị tối thiểu'
                      onChange={(value) => {
                        field.onChange(value ?? null);
                      }}
                      value={field.value ?? undefined}
                      min={0}
                      formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label='Giá trị tối đa'>
                <Controller
                  name='maxAmount'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Nhập giá trị tối đa'
                      onChange={(value) => {
                        field.onChange(value ?? null);
                      }}
                      value={field.value ?? undefined}
                      min={0}
                      formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 3: Nút điều khiển */}
          <Row>
            <Col xs={24}>
              <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 8 }}>
                <Space size='middle'>
                  <Button icon={<ClearOutlined />} onClick={handleReset}>
                    Xóa bộ lọc
                  </Button>
                  <Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
                    Áp dụng
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Card>
  );
};

export default OrderFilters;
