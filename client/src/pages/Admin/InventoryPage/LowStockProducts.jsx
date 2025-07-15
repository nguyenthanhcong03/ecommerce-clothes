import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Pagination,
  Input,
  Spin,
  Alert,
  Typography,
  Card,
  Modal,
  InputNumber,
  Select,
  message
} from 'antd';
import { EditOutlined, WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLowStockProducts, bulkUpdateStock } from '@/store/slices/adminInventorySlice';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const { Title, Text } = Typography;
const { Option } = Select;

const LowStockProducts = () => {
  const dispatch = useDispatch();
  const { lowStockProducts, loading, totalLowStock, error } = useSelector((state) => state.adminInventory);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [threshold, setThreshold] = useState(5);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calculatedNewStock, setCalculatedNewStock] = useState(0);

  // Schema xác thực cho form cập nhật tồn kho
  const stockUpdateSchema = yup.object({
    currentStock: yup.number().required(),
    stockChange: yup
      .number()
      .required('Vui lòng nhập số lượng thay đổi')
      .test('not-below-current', 'Số lượng giảm không thể lớn hơn tồn kho hiện tại', function (value) {
        const currentStock = this.parent.currentStock || 0;
        return value >= -currentStock;
      }),
    reason: yup.string().required('Vui lòng chọn lý do'),
    notes: yup.string().optional()
  });

  // Khởi tạo react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(stockUpdateSchema),
    defaultValues: {
      currentStock: 0,
      stockChange: 0,
      reason: 'adjustment',
      notes: ''
    }
  });

  // Xử lý khi giá trị stockChange thay đổi
  const handleStockChangeUpdate = (value) => {
    const currentStock = watch('currentStock') || 0;
    const change = value || 0;
    const newStock = currentStock + change;
    setCalculatedNewStock(newStock >= 0 ? newStock : 0);
  };

  const loadLowStockProducts = useCallback(
    async (page = 1, limit = 10, stockThreshold = 5) => {
      try {
        await dispatch(
          fetchLowStockProducts({
            page,
            limit,
            threshold: stockThreshold
          })
        );
      } catch (err) {
        console.error('Error fetching low stock products:', err);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadLowStockProducts(pagination.current, pagination.pageSize, threshold);
  }, [pagination, loadLowStockProducts]);

  const handleTableChange = (pagination) => {
    loadLowStockProducts(pagination.current, pagination.pageSize, threshold);
  };

  const handleThresholdChange = (value) => {
    setThreshold(value);
  };

  const applyThresholdFilter = () => {
    loadLowStockProducts(1, pagination.pageSize, threshold);
  };

  const showEditModal = (product, variant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setValue('currentStock', variant.stock);
    setValue('stockChange', 0);
    setValue('reason', 'adjustment');
    setValue('notes', '');
    setCalculatedNewStock(variant.stock);
    setEditModalVisible(true);
  };
  const onSubmit = async (data) => {
    try {
      const newQuantity = data.currentStock + data.stockChange;

      await dispatch(
        bulkUpdateStock({
          items: [
            {
              productId: selectedProduct._id,
              variantId: selectedVariant._id,
              quantity: newQuantity
            }
          ],
          reason: data.reason,
          notes: data.notes
        })
      );

      setEditModalVisible(false);
      loadLowStockProducts(pagination.current, pagination.pageSize, threshold);
    } catch (err) {
      console.error('Error updating stock:', err);
      message.error('Không thể cập nhật số lượng tồn kho');
    }
  };

  const getStockStatusTag = (stock) => {
    if (stock === 0) {
      return <Tag color='red'>Hết hàng</Tag>;
    } else if (stock <= 5) {
      return <Tag color='orange'>Sắp hết hàng</Tag>;
    } else {
      return <Tag color='green'>Còn hàng</Tag>;
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type='secondary'>{record.brand}</Text>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName'
    },
    {
      title: 'Biến thể sắp hết hàng',
      dataIndex: 'lowStockVariants',
      key: 'lowStockVariants',
      render: (variants, record) => (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {variants.map((variant) => (
            <Card
              key={variant._id}
              size='small'
              style={{ marginBottom: '8px' }}
              title={<div style={{ fontSize: '12px' }}>SKU: {variant.sku}</div>}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div>
                    <Tag color='blue'>{variant.size}</Tag>
                    <Tag color='purple'>{variant.color}</Tag>
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    {getStockStatusTag(variant.stock)}
                    <span style={{ marginLeft: '5px' }}>
                      Còn hàng: <strong>{variant.stock}</strong>
                    </span>
                  </div>
                </div>
                <Button
                  type='primary'
                  icon={<EditOutlined />}
                  size='small'
                  onClick={() => showEditModal(record, variant)}
                >
                  Cập nhật
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4}>
          <WarningOutlined style={{ color: '#faad14', marginRight: '8px' }} />
          Sản phẩm sắp hết hàng
        </Title>

        <Space>
          <Text>Ngưỡng tối thiểu:</Text>
          <InputNumber min={0} value={threshold} onChange={handleThresholdChange} style={{ width: '100px' }} />
          <Button type='primary' onClick={applyThresholdFilter}>
            Áp dụng
          </Button>
        </Space>
      </div>

      {error && <Alert message={error} type='error' showIcon style={{ marginBottom: '16px' }} />}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={lowStockProducts}
          rowKey='_id'
          pagination={false}
          onChange={handleTableChange}
        />

        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={totalLowStock || 0}
            onChange={(page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize
              });
            }}
            showSizeChanger
            onShowSizeChange={(current, size) => {
              setPagination({
                ...pagination,
                current,
                pageSize: size
              });
            }}
          />
        </div>
      </Spin>

      <Modal
        title='Cập nhật tồn kho'
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        {selectedVariant && selectedProduct && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>{selectedProduct.name}</Text>
              <div>
                <Tag color='blue'>{selectedVariant.size}</Tag>
                <Tag color='purple'>{selectedVariant.color}</Tag>
                <Tag>SKU: {selectedVariant.sku}</Tag>
              </div>
            </div>

            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium'>Tồn kho hiện tại</label>
              <Controller
                name='currentStock'
                control={control}
                render={({ field }) => <InputNumber {...field} disabled style={{ width: '100%' }} />}
              />
            </div>

            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium'>Thay đổi số lượng</label>
              <Controller
                name='stockChange'
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    placeholder='Nhập số dương để thêm, số âm để giảm'
                    addonBefore={<span style={{ fontSize: '12px' }}>+/-</span>}
                    onChange={(value) => {
                      field.onChange(value);
                      handleStockChangeUpdate(value);
                    }}
                  />
                )}
              />
              {errors.stockChange && <p className='mt-1 text-sm text-red-500'>{errors.stockChange.message}</p>}
            </div>

            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium'>Tồn kho sau cập nhật</label>
              <InputNumber style={{ width: '100%' }} value={calculatedNewStock} disabled />
            </div>

            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium'>Lý do</label>
              <Controller
                name='reason'
                control={control}
                render={({ field }) => (
                  <Select {...field} style={{ width: '100%' }}>
                    <Option value='import'>Nhập hàng</Option>
                    <Option value='export'>Xuất hàng</Option>
                    <Option value='adjustment'>Điều chỉnh tồn kho</Option>
                  </Select>
                )}
              />
              {errors.reason && <p className='mt-1 text-sm text-red-500'>{errors.reason.message}</p>}
            </div>

            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium'>Ghi chú</label>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => <Input.TextArea {...field} rows={4} />}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type='primary' htmlType='submit' loading={isSubmitting}>
                Cập nhật
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LowStockProducts;
