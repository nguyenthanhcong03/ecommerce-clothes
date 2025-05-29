import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Select, Card, Row, Col, Space, InputNumber, TreeSelect } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { getCategoriesTree } from '@/store/slices/categorySlice';
import { useDispatch, useSelector } from 'react-redux';

const { Option } = Select;

const ProductFilter = ({ filters, onFilterChange, onResetFilters }) => {
  const dispatch = useDispatch();
  const { categoriesTree } = useSelector((state) => state.category);
  const [expanded, setExpanded] = useState(false);

  // Lấy danh sách danh mục
  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);
  // Setup react-hook-form
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null
    }
  });
  // Đồng bộ form values khi filters từ props thay đổi
  useEffect(() => {
    // Cập nhật giá trị từ filters vào form
    setValue('search', filters.search || '');
    setValue('category', filters.category || '');
    setValue('minPrice', filters.minPrice || undefined);
    setValue('maxPrice', filters.maxPrice || undefined);
  }, [filters, setValue]);
  const handleFormSubmit = (data) => {
    onFilterChange(data);
  };
  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null
    });

    // Gọi callback để reset filters ở component cha
    onResetFilters();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Chuyển đổi dữ liệu cây danh mục thành định dạng cho TreeSelect
  const buildCategoryTreeData = (categories) => {
    if (!categories) return [];

    return categories.map((category) => ({
      title: category.name,
      value: category._id,
      key: category._id,
      children: category.children ? buildCategoryTreeData(category.children) : []
    }));
  };

  const categoryTreeData = buildCategoryTreeData(categoriesTree);

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

ProductFilter.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number
  }),
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired
};

export default ProductFilter;
