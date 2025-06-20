import { getCategoriesTree } from '@/store/slices/categorySlice';
import { ClearOutlined, DownOutlined, FilterOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, InputNumber, Row, Select, Space, TreeSelect } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const ProductFilter = ({ onFilterChange, onResetFilter }) => {
  const dispatch = useDispatch();
  const { categoriesTree } = useSelector((state) => state.category);
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

  const buildDataForTreeSelect = (categories) => {
    if (!categories) return [];

    return categories.map((category) => ({
      title: category.name,
      value: category._id,
      key: category._id,
      children: category.children ? buildDataForTreeSelect(category.children) : []
    }));
  };

  const categoryTreeData = buildDataForTreeSelect(categoriesTree);
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      category: '',
      minPrice: null,
      maxPrice: null,
      color: [],
      size: [],
      stockStatus: 'all'
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
      category: '',
      minPrice: null,
      maxPrice: null,
      color: [],
      size: [],
      stockStatus: 'all'
    });

    onResetFilter();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Lấy danh sách danh mục
  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={headerStyle} onClick={handleExpandClick}>
        <Space>
          <FilterOutlined />
          <span>Bộ lọc sản phẩm</span>
        </Space>
        <Button type='text' icon={expanded ? <UpOutlined /> : <DownOutlined />} />
      </div>

      {expanded && (
        <Form layout='vertical' onFinish={handleSubmit(handleFormSubmit)}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Danh mục'>
                <Controller
                  name='category'
                  control={control}
                  render={({ field }) => (
                    <TreeSelect
                      {...field}
                      treeData={categoryTreeData}
                      placeholder='Chọn danh mục'
                      allowClear
                      value={field.value || undefined}
                      onChange={(value) => {
                        field.onChange(value === undefined ? null : value);
                      }}
                      showSearch
                      treeNodeFilterProp='title'
                      style={{ width: '100%' }}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Giá từ'>
                <Controller
                  name='minPrice'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Giá tối thiểu'
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>{' '}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Giá đến'>
                <Controller
                  name='maxPrice'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Giá tối đa'
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Màu sắc'>
                <Controller
                  name='color'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode='multiple'
                      allowClear
                      placeholder='Chọn màu sắc'
                      style={{ width: '100%' }}
                      options={[
                        { value: 'Đen', label: 'Đen' },
                        { value: 'Trắng', label: 'Trắng' },
                        { value: 'Đỏ', label: 'Đỏ' },
                        { value: 'Xanh dương', label: 'Xanh dương' },
                        { value: 'Xanh lá', label: 'Xanh lá' },
                        { value: 'Vàng', label: 'Vàng' },
                        { value: 'Tím', label: 'Tím' },
                        { value: 'Hồng', label: 'Hồng' },
                        { value: 'Xám', label: 'Xám' },
                        { value: 'Nâu', label: 'Nâu' }
                      ]}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Kích thước'>
                <Controller
                  name='size'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode='multiple'
                      allowClear
                      placeholder='Chọn kích thước'
                      style={{ width: '100%' }}
                      options={[
                        { value: 'XS', label: 'XS' },
                        { value: 'S', label: 'S' },
                        { value: 'M', label: 'M' },
                        { value: 'L', label: 'L' },
                        { value: 'XL', label: 'XL' },
                        { value: 'XXL', label: 'XXL' },
                        { value: '35', label: '35' },
                        { value: '36', label: '36' },
                        { value: '37', label: '37' },
                        { value: '38', label: '38' },
                        { value: '39', label: '39' },
                        { value: '40', label: '40' },
                        { value: '41', label: '41' },
                        { value: '42', label: '42' },
                        { value: '43', label: '43' }
                      ]}
                    />
                  )}
                />
              </Form.Item>
            </Col>{' '}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tình trạng hàng'>
                <Controller
                  name='stockStatus'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      placeholder='Chọn tình trạng'
                      style={{ width: '100%' }}
                      options={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'in_stock', label: 'Còn hàng' },
                        { value: 'low_stock', label: 'Sắp hết hàng' },
                        { value: 'out_of_stock', label: 'Hết hàng' }
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

ProductFilter.propTypes = {
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

export default ProductFilter;
