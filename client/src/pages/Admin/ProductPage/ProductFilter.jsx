import { useGetAllSizeColor } from '@/hooks/useGetAllSizeColor';
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

  const { allSizes, allColors } = useGetAllSizeColor();

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
          {/* Hàng 1: Danh mục và Giá */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Danh mục sản phẩm'>
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
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Giá tối thiểu'>
                <Controller
                  name='minPrice'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Nhập giá tối thiểu'
                      min={0}
                      formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label='Giá tối đa'>
                <Controller
                  name='maxPrice'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder='Nhập giá tối đa'
                      min={0}
                      formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/₫\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2: Thuộc tính sản phẩm */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
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
                      maxTagCount='responsive'
                    >
                      {allColors &&
                        allColors.map((color) => (
                          <Select.Option key={color} value={color}>
                            {color}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
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
                      maxTagCount='responsive'
                    >
                      {allSizes &&
                        allSizes.map((size) => (
                          <Select.Option key={size} value={size}>
                            {size}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
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
