import React, { useState } from 'react';
import { Card, Space, Input, Button, Select, DatePicker, Row, Col, Divider, InputNumber } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined, CalendarOutlined } from '@ant-design/icons';
import { orderStatuses } from '@/utils/helpers/orderStatusUtils';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderFilters = ({ onSearch, onFilterChange, onClear, searchText, loading }) => {
  const [localFilters, setLocalFilters] = useState({
    status: undefined,
    paymentStatus: undefined,
    dateRange: undefined,
    paymentMethod: undefined,
    minAmount: undefined,
    maxAmount: undefined
  });

  // Xử lý thay đổi text tìm kiếm
  const handleSearchChange = (e) => {
    onSearch(e);
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (name, value) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
  };

  // Áp dụng các filter
  const applyFilters = () => {
    // Chuyển đổi giá trị dates thành dạng param cho API
    const formattedFilters = { ...localFilters };

    // Xử lý dateRange để gửi đúng định dạng cho API
    if (formattedFilters.dateRange && formattedFilters.dateRange.length === 2) {
      formattedFilters.startDate = formattedFilters.dateRange[0].format('YYYY-MM-DD');
      formattedFilters.endDate = formattedFilters.dateRange[1].format('YYYY-MM-DD');
    }

    onFilterChange(formattedFilters);
  };
  // Reset các filter
  const clearFilters = () => {
    setLocalFilters({
      status: undefined,
      paymentStatus: undefined,
      dateRange: undefined,
      paymentMethod: undefined,
      minAmount: undefined,
      maxAmount: undefined
    });
    onClear();
  };

  return (
    <Card className='mb-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
        <Space>
          <Input
            placeholder='Tìm kiếm theo mã đơn hàng, khách hàng, email...'
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 350 }}
            allowClear
          />
        </Space>
        <Space>
          <Button onClick={applyFilters} type='primary' icon={<FilterOutlined />} loading={loading}>
            Lọc
          </Button>
          <Button onClick={clearFilters} icon={<ClearOutlined />} disabled={loading}>
            Xóa bộ lọc
          </Button>
        </Space>
      </div>
      <Divider style={{ margin: '12px 0' }} />{' '}
      <Row gutter={16}>
        <Col sm={24} md={6}>
          <div className='mb-2 font-medium'>Trạng thái đơn hàng</div>
          <Select
            placeholder='Chọn trạng thái đơn hàng'
            style={{ width: '100%' }}
            value={localFilters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
          >
            {orderStatuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col sm={24} md={6}>
          <div className='mb-2 font-medium'>Trạng thái thanh toán</div>
          <Select
            placeholder='Chọn trạng thái thanh toán'
            style={{ width: '100%' }}
            value={localFilters.paymentStatus}
            onChange={(value) => handleFilterChange('paymentStatus', value)}
            allowClear
          >
            <Option value={true}>Đã thanh toán</Option>
            <Option value={false}>Chưa thanh toán</Option>
          </Select>
        </Col>
        <Col sm={24} md={6}>
          <div className='mb-2 font-medium'>Phương thức thanh toán</div>
          <Select
            placeholder='Chọn phương thức thanh toán'
            style={{ width: '100%' }}
            value={localFilters.paymentMethod}
            onChange={(value) => handleFilterChange('paymentMethod', value)}
            allowClear
          >
            <Option value='COD'>Thanh toán khi nhận hàng (COD)</Option>
            <Option value='Momo'>Thanh toán qua MoMo</Option>
            <Option value='VNPay'>Thanh toán qua VNPay</Option>
          </Select>
        </Col>
        <Col sm={24} md={6}>
          <div className='mb-2 font-medium'>Thời gian đặt hàng</div>
          <RangePicker
            style={{ width: '100%' }}
            format='DD/MM/YYYY'
            value={localFilters.dateRange}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            locale={locale}
            placeholder={['Từ ngày', 'Đến ngày']}
            allowClear
            suffixIcon={<CalendarOutlined />}
          />
        </Col>
      </Row>
      <Row gutter={16} className='mt-4'>
        <Col sm={24} md={12}>
          <div className='mb-2 font-medium'>Giá trị đơn hàng</div>
          <Row gutter={16}>
            <Col span={12}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder='Giá trị tối thiểu'
                value={localFilters.minAmount}
                onChange={(value) => handleFilterChange('minAmount', value)}
                min={0}
                formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder='Giá trị tối đa'
                value={localFilters.maxAmount}
                onChange={(value) => handleFilterChange('maxAmount', value)}
                min={0}
                formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderFilters;
