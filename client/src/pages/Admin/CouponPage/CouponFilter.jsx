import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Select, DatePicker, Card, Row, Col, Space } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import moment from 'moment';

const CouponFilter = ({ filters, onFilterChange, onResetFilters }) => {
  const [expanded, setExpanded] = useState(false);

  // Setup react-hook-form
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      code: '',
      isActive: '',
      startDate: null,
      endDate: null
    }
  });

  // Đồng bộ form values khi filters từ props thay đổi
  useEffect(() => {
    // Cập nhật giá trị từ filters vào form
    // setValue('code', filters.code || '');
    // setValue('isActive', filters.isActive || '');
    // // Xử lý các giá trị ngày tháng
    // if (filters.startDate) {
    //   setValue('startDate', moment(filters.startDate));
    // } else {
    //   setValue('startDate', null);
    // }
    // if (filters.endDate) {
    //   setValue('endDate', moment(filters.endDate));
    // } else {
    //   setValue('endDate', null);
    // }
  }, [filters, setValue]);
  const handleFormSubmit = (data) => {
    // Xử lý và chuẩn hóa dữ liệu trước khi gửi đi
    const cleanValues = {};

    // Xử lý code - chỉ thêm khi có giá trị
    if (data.code) cleanValues.code = data.code;

    // Xử lý isActive - cần kiểm tra rõ ràng để bao gồm cả trường hợp false
    if (data.isActive !== undefined && data.isActive !== '') {
      cleanValues.isActive = data.isActive;
    }

    if (data.startDate) {
      // Kiểm tra xem data.startDate có phải đối tượng moment không
      cleanValues.startDate = moment.isMoment(data.startDate)
        ? data.startDate.format('YYYY-MM-DD')
        : moment(data.startDate).format('YYYY-MM-DD');
    }

    if (data.endDate) {
      // Kiểm tra xem data.endDate có phải đối tượng moment không
      cleanValues.endDate = moment.isMoment(data.endDate)
        ? data.endDate.format('YYYY-MM-DD')
        : moment(data.endDate).format('YYYY-MM-DD');
    }

    onFilterChange(data);
  };
  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      code: '',
      isActive: '',
      startDate: null,
      endDate: null
    });

    // Gọi callback để reset filters ở component cha
    onResetFilters();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const headerStyle = {
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    borderBottom: expanded ? '1px solid #f0f0f0' : 'none'
  };

  return (
    <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: expanded ? 16 : 0 }} bordered={true}>
      <div style={headerStyle} onClick={handleExpandClick}>
        <Space>
          <FilterOutlined />
          <span>Bộ lọc</span>
        </Space>
        <Button type='text' icon={expanded ? <UpOutlined /> : <DownOutlined />} />
      </div>

      {expanded && (
        <Form layout='vertical' onFinish={handleSubmit(handleFormSubmit)}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Mã giảm giá'>
                <Controller
                  name='code'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='Tìm theo mã' prefix={<SearchOutlined />} allowClear />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              {' '}
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
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      style={{ width: '100%' }}
                      format='DD/MM/YYYY'
                      placeholder='Chọn ngày bắt đầu'
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Đến ngày'>
                <Controller
                  name='endDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      style={{ width: '100%' }}
                      format='DD/MM/YYYY'
                      placeholder='Chọn ngày kết thúc'
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Space>
                  <Button icon={<ClearOutlined />} onClick={handleReset}>
                    Xóa bộ lọc
                  </Button>
                  <Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
                    Tìm kiếm
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
  filters: PropTypes.shape({
    code: PropTypes.string,
    isActive: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired
};

export default CouponFilter;
