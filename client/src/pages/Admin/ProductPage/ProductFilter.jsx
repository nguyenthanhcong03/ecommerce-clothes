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
      categoryId: '',
      minPrice: null,
      maxPrice: null,
      isActive: '',
      inStock: ''
    }
  });
  // Đồng bộ form values khi filters từ props thay đổi
  useEffect(() => {
    // Cập nhật giá trị từ filters vào form
    setValue('search', filters.search || '');
    setValue('categoryId', filters.categoryId || '');
    setValue('minPrice', filters.minPrice || undefined);
    setValue('maxPrice', filters.maxPrice || undefined);
    setValue('isActive', filters.isActive !== undefined ? String(filters.isActive) : '');
    setValue('inStock', filters.inStock !== undefined ? String(filters.inStock) : '');
  }, [filters, setValue]);
  const handleFormSubmit = (data) => {
    // // Xử lý và chuẩn hóa dữ liệu trước khi gửi đi
    // const cleanValues = {};

    // // Xử lý search - chỉ thêm khi có giá trị
    // if (data.search) cleanValues.search = data.search;

    // // Xử lý categoryId
    // if (data.categoryId) cleanValues.categoryId = data.categoryId;

    // // Xử lý khoảng giá
    // if (data.minPrice !== null && data.minPrice !== undefined) cleanValues.minPrice = data.minPrice;
    // if (data.maxPrice !== null && data.maxPrice !== undefined) cleanValues.maxPrice = data.maxPrice;

    // // Xử lý isActive - cần kiểm tra rõ ràng để bao gồm cả trường hợp false
    // if (data.isActive !== undefined && data.isActive !== '') {
    //   cleanValues.isActive = data.isActive;
    // }

    // // Xử lý inStock
    // if (data.inStock !== undefined && data.inStock !== '') {
    //   cleanValues.inStock = data.inStock;
    // }

    // // Xử lý sortBy và sortOrder
    // if (data.sortBy) cleanValues.sortBy = data.sortBy;
    // if (data.sortOrder) cleanValues.sortOrder = data.sortOrder;

    onFilterChange(data);
  };
  const handleReset = () => {
    // Đặt lại tất cả các giá trị form về mặc định
    reset({
      search: '',
      categoryId: '',
      minPrice: null,
      maxPrice: null,
      isActive: '',
      inStock: ''
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
                  name='categoryId'
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
              <Form.Item label='Trạng thái'>
                <Controller
                  name='isActive'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder='Tất cả'
                      allowClear
                      value={field.value || undefined}
                      onChange={(value) => {
                        field.onChange(value === undefined ? '' : value);
                      }}
                    >
                      <Option value='true'>Đang kích hoạt</Option>
                      <Option value='false'>Đã vô hiệu hóa</Option>
                    </Select>
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
    categoryId: PropTypes.string,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    isActive: PropTypes.string,
    inStock: PropTypes.string
  }),
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired
};

export default ProductFilter;
