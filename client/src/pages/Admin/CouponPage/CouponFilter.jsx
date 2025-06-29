import { ClearOutlined, DownOutlined, FilterOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
const { RangePicker } = DatePicker;

const CouponFilter = ({ onFilterChange, onResetFilter }) => {
  const { coupons, pagination, filters, loading, error } = useSelector((state) => state.adminCoupon);
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
      // discountRange: '', // Chọn ngày tháng #cách 2
      isActive: '',
      startDate: null,
      endDate: null
    }
  });

  const handleFormSubmit = (data) => {
    // const [startDate, endDate] = data.discountRange || [];
    // console.log('startDate', startDate.toDate());
    // console.log('endDate', endDate);
    // // Convert dayjs to JS Date if needed

    onFilterChange(data);
  };

  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      discountRange: '',
      isActive: '',
      startDate: null,
      endDate: null
    });

    // Gọi callback để reset filters ở component cha
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
          <span>Bộ lọc mã giảm giá</span>
        </Space>
        <Button type='text' icon={expanded ? <UpOutlined /> : <DownOutlined />} />
      </div>

      {expanded && (
        <Form layout='vertical' onFinish={handleSubmit(handleFormSubmit)}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái'>
                <Controller
                  name='isActive'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder='Tất cả'
                      allowClear
                      onChange={(value) => {
                        // Đảm bảo xử lý giá trị khi clear
                        field.onChange(value === undefined ? '' : value);
                      }}
                      value={field.value || undefined}
                    >
                      <Select.Option value='true'>Đang kích hoạt</Select.Option>
                      <Select.Option value='false'>Đã vô hiệu hóa</Select.Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Từ ngày'>
                <Controller
                  control={control}
                  name='startDate'
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
              {/* <Controller
                control={control}
                name='discountRange'
                render={({ field }) => (
                  <RangePicker
                    showTime
                    {...field}
                    value={field.value ? [dayjs(field.value[0]), dayjs(field.value[1])] : []}
                    onChange={(dates) => field.onChange(dates)}
                    style={{ width: '100%' }}
                  />
                )}
              /> */}
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Đến ngày'>
                <Controller
                  control={control}
                  name='endDate'
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

            <Col xs={24}>
              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
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

CouponFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  onResetFilter: PropTypes.func.isRequired
};

export default CouponFilter;
