import { ClearOutlined, DownOutlined, FilterOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Row, Select, Space } from 'antd';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const UserFilter = ({ onFilterChange, onResetFilter }) => {
  const { users, pagination, filters, sort, loading, error } = useSelector((state) => state.adminUser);
  const [expanded, setExpanded] = useState(false);

  const headerStyle = {
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    borderBottom: expanded ? '1px solid #f0f0f0' : 'none'
  };

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      role: '',
      isBlocked: null
    }
  });

  // useEffect(() => {
  //   setValue('search', filters.search || '');
  //   setValue('category', filters.category || '');
  //   setValue('minPrice', filters.minPrice || undefined);
  //   setValue('maxPrice', filters.maxPrice || undefined);
  //   setValue('color', filters.color || []);
  //   setValue('size', filters.size || []);
  //   setValue('stockStatus', filters.stockStatus || 'all');
  // }, [filters, setValue]);

  const handleFormSubmit = (data) => {
    onFilterChange(data);
  };
  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      role: '',
      isBlocked: null
    });

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
          <span>Bộ lọc người dùng</span>
        </Space>
        <Button type='text' icon={expanded ? <UpOutlined /> : <DownOutlined />} />
      </div>

      {expanded && (
        <Form layout='vertical' onFinish={handleSubmit(handleFormSubmit)}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Vai trò'>
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      placeholder='Chọn vai trò'
                      style={{ width: '100%' }}
                      value={field.value || undefined}
                      onChange={(value) => {
                        field.onChange(value === undefined ? null : value);
                      }}
                      options={[
                        { value: 'customer', label: 'CUSTOMER' },
                        { value: 'admin', label: 'ADMIN' }
                      ]}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái'>
                <Controller
                  name='isBlocked'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      placeholder='Chọn trạng thái'
                      style={{ width: '100%' }}
                      options={[
                        { value: 'false', label: 'Hoạt đông' },
                        { value: 'true', label: 'Bị cấm' }
                      ]}
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
                    Lọc
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

UserFilter.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    color: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.arrayOf(PropTypes.string),
    stockStatus: PropTypes.string
  }),
  onFilterChange: PropTypes.func.isRequired,
  onResetFilter: PropTypes.func.isRequired
};

export default UserFilter;
