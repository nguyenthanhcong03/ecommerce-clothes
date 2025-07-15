import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Table,
  Input,
  InputNumber,
  Space,
  Select,
  Typography,
  Card,
  Alert,
  Modal,
  Spin,
  message,
  Tabs,
  Badge,
  Tooltip,
  Row,
  Col
} from 'antd';
import { useForm, Controller } from 'react-hook-form';
import {
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  ImportOutlined
} from '@ant-design/icons';
import useDebounce from '@/hooks/useDebounce';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/slices/adminProductSlice';
import { fetchProductDetail, bulkUpdateStock } from '@/store/slices/adminInventorySlice';

const { Text } = Typography;
const { Option } = Select;

const BulkStockUpdate = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.adminProduct);
  const { selectedProduct, productDetailLoading, bulkUpdateLoading, success } = useSelector(
    (state) => state.adminInventory
  );

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: {
      reason: ''
    }
  });

  const [selectedVariants, setSelectedVariants] = useState([]);
  const [itemsToUpdate, setItemsToUpdate] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Tải danh sách sản phẩm cho tìm kiếm
  const searchProducts = useCallback(
    async (term) => {
      setSearchLoading(true);
      try {
        await dispatch(
          fetchProducts({
            search: term || '',
            page: 1,
            limit: term ? 10 : 20 // Hiển thị nhiều sản phẩm hơn khi không tìm kiếm
          })
        );
      } catch (error) {
        console.error('Error searching products:', error);
        message.error('Không thể tìm kiếm sản phẩm');
      } finally {
        setSearchLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      searchProducts(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchProducts]);

  // Tải danh sách sản phẩm khi component được mount
  useEffect(() => {
    // Tải tất cả sản phẩm ban đầu (không có từ khóa tìm kiếm)
    searchProducts('');
  }, [searchProducts]);

  // Xử lý khi cập nhật tồn kho thành công
  useEffect(() => {
    if (success) {
      dispatch({ type: 'adminInventory/clearSuccess' });
    }
  }, [success, dispatch]);

  // Xử lý khi chọn sản phẩm
  const handleSelectProduct = async (productId) => {
    try {
      await dispatch(fetchProductDetail(productId));
      setSelectedVariants([]);
    } catch (error) {
      console.error('Error fetching product details:', error);
      message.error('Lỗi khi lấy thông tin sản phẩm');
    }
  };

  // Xử lý khi chọn biến thể để cập nhật
  const handleSelectVariant = (variant) => {
    setSelectedVariants((prev) => {
      // Nếu đã chọn rồi thì bỏ chọn
      if (prev.some((v) => v._id === variant._id)) {
        return prev.filter((v) => v._id !== variant._id);
      }
      // Nếu chưa chọn thì thêm vào
      return [...prev, variant];
    });
  };

  // Thêm biến thể đã chọn vào danh sách cập nhật
  const addSelectedVariantsToUpdate = () => {
    if (!selectedProduct || selectedVariants.length === 0) {
      message.warning('Vui lòng chọn sản phẩm và biến thể');
      return;
    }

    const newItems = selectedVariants.map((variant) => ({
      key: `${selectedProduct._id}-${variant._id}`,
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      variantId: variant._id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      currentStock: variant.stock,
      newStock: variant.stock, // Giá trị tồn kho ban đầu giữ nguyên (sẽ thay đổi khi người dùng nhập số lượng)
      stockChange: 0, // Giá trị mặc định là 0 (không thay đổi)
      notes: ''
    }));

    // Thêm vào danh sách nhưng loại bỏ các item trùng lặp
    setItemsToUpdate((prev) => {
      const existingKeys = prev.map((item) => item.key);
      const filteredNewItems = newItems.filter((item) => !existingKeys.includes(item.key));
      return [...prev, ...filteredNewItems];
    });

    // Reset selection
    setSelectedVariants([]);
  };

  // Xóa một item khỏi danh sách cập nhật
  const removeItemFromUpdate = (key) => {
    setItemsToUpdate((prev) => prev.filter((item) => item.key !== key));
  };

  // Cập nhật giá trị newStock cho một item dựa trên sự thay đổi
  const updateItemNewStock = (key, newValue) => {
    setItemsToUpdate((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              newStock: newValue,
              stockChange: newValue - item.currentStock
            }
          : item
      )
    );
  };

  // Cập nhật ghi chú cho một item
  const updateItemNotes = (key, value) => {
    setItemsToUpdate((prev) => prev.map((item) => (item.key === key ? { ...item, notes: value } : item)));
  };

  // Xử lý khi nhấn nút lưu
  const handleSave = () => {
    if (itemsToUpdate.length === 0) {
      message.warning('Vui lòng thêm sản phẩm để cập nhật');
      return;
    }

    // Kiểm tra xem có sự thay đổi số lượng không
    const hasChanges = itemsToUpdate.some((item) => item.currentStock !== item.newStock);
    if (!hasChanges) {
      message.warning('Không phát hiện thay đổi số lượng tồn kho');
      return;
    }

    setConfirmModalVisible(true);
  };

  // Xử lý xác nhận và gửi cập nhật lên server
  const confirmBulkUpdate = async () => {
    const values = getValues();
    if (!values.reason) {
      message.error('Vui lòng chọn lý do cập nhật');
      return;
    }

    const items = itemsToUpdate.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.newStock,
      notes: item.notes
    }));

    try {
      await dispatch(
        bulkUpdateStock({
          items,
          reason: values.reason
        })
      );

      message.success('Cập nhật tồn kho thành công');
      setItemsToUpdate([]);
      setConfirmModalVisible(false);
      reset();
    } catch (error) {
      console.error('Error updating stock:', error);
      message.error('Lỗi khi cập nhật tồn kho');
    }
  };

  // Cột cho bảng variant của sản phẩm đã chọn
  const variantColumns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku'
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color'
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type={selectedVariants.some((v) => v._id === record._id) ? 'primary' : 'default'}
          onClick={() => handleSelectVariant(record)}
        >
          {selectedVariants.some((v) => v._id === record._id) ? 'Đã chọn' : 'Chọn'}
        </Button>
      )
    }
  ];

  // Cột cho bảng danh sách cập nhật
  const updateListColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Biến thể',
      key: 'variant',
      render: (_, record) => (
        <div>
          <div>SKU: {record.sku}</div>
          <div>
            {record.size} / {record.color}
          </div>
        </div>
      )
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock'
    },
    {
      title: 'Thay đổi số lượng',
      key: 'stockChange',
      render: (_, record) => (
        <InputNumber
          min={-record.currentStock}
          defaultValue={record.stockChange || 0}
          onChange={(value) => {
            const changeValue = value || 0;
            const newStock = record.currentStock + changeValue;
            updateItemNewStock(record.key, newStock >= 0 ? newStock : 0);
          }}
          style={{ width: '100px' }}
          addonBefore={<span style={{ fontSize: '12px' }}>+/-</span>}
          placeholder='Nhập số lượng'
        />
      )
    },
    {
      title: 'Tồn kho sau cập nhật',
      key: 'newStock',
      render: (_, record) => <span style={{ fontWeight: 'bold' }}>{record.newStock}</span>
    },
    {
      title: 'Ghi chú',
      key: 'notes',
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={(e) => updateItemNotes(record.key, e.target.value)}
          placeholder={'Ghi chú (không bắt buộc)'}
          style={{ width: '200px' }}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => removeItemFromUpdate(record.key)}>
          Xóa
        </Button>
      )
    }
  ];

  return (
    <div className='bulk-stock-update-container'>
      <Typography.Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <UploadOutlined style={{ marginRight: '12px' }} />
        Cập nhật hàng loạt
      </Typography.Title>

      <Spin spinning={loading || productDetailLoading || bulkUpdateLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'search',
              label: (
                <span>
                  <SearchOutlined />
                  Tìm và chọn sản phẩm
                </span>
              ),
              children: (
                <Card bordered={false} className='product-search-card'>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <Input.Search
                          placeholder='Tìm kiếm sản phẩm...'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onSearch={(value) => searchProducts(value)}
                          loading={searchLoading || loading}
                          enterButton
                          style={{ maxWidth: '600px' }}
                        />
                        <Tooltip title='Nhập từ khóa để tìm kiếm sản phẩm'>
                          <QuestionCircleOutlined style={{ marginLeft: '8px' }} />
                        </Tooltip>
                      </div>

                      <Alert
                        message={`Hướng dẫn: Nhấn chọn vào sản phẩm để xem biến thể và cập nhật tồn kho`}
                        type='info'
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />

                      {products && products.length > 0 ? (
                        <>
                          <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                            {searchTerm.length >= 2 ? 'Kết quả tìm kiếm' : 'Tất cả sản phẩm'}
                            <Badge
                              count={products.length}
                              style={{ backgroundColor: '#52c41a', marginLeft: '8px' }}
                              overflowCount={999}
                            />
                          </Typography.Title>

                          <Table
                            dataSource={products}
                            rowKey='_id'
                            size='small'
                            scroll={{ y: 300 }}
                            pagination={
                              products.length > 10
                                ? {
                                    pageSize: 10,
                                    size: 'small',
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '50'],
                                    showTotal: (total) => `Tổng ${total} sản phẩm`
                                  }
                                : false
                            }
                            style={{ marginBottom: '16px' }}
                            columns={[
                              {
                                title: 'Sản phẩm',
                                dataIndex: 'name',
                                key: 'name',
                                render: (text, record) => (
                                  <div>
                                    <div>
                                      <Text strong>{text}</Text>
                                    </div>
                                    <div>
                                      <Text type='secondary'>{record.brand}</Text>
                                    </div>
                                  </div>
                                )
                              },
                              {
                                title: 'Danh mục',
                                dataIndex: 'category',
                                key: 'category'
                              },
                              {
                                title: 'Thao tác',
                                key: 'actions',
                                render: (_, record) => (
                                  <Button type='primary' onClick={() => handleSelectProduct(record._id)}>
                                    Chọn
                                  </Button>
                                )
                              }
                            ]}
                          />
                        </>
                      ) : (
                        <>
                          {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                              <Spin size='large' />
                              <div style={{ marginTop: '16px' }}>
                                <Text type='secondary'>Đang tải danh sách sản phẩm...</Text>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                              <SearchOutlined style={{ fontSize: '32px', color: '#bfbfbf', marginBottom: '16px' }} />
                              <div>
                                <Text type='secondary'>Không tìm thấy sản phẩm nào</Text>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>

                  {selectedProduct && (
                    <Card
                      title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Badge status='processing' />
                          <Text strong style={{ marginLeft: '8px' }}>
                            {selectedProduct.name}
                          </Text>
                          <Text type='secondary' style={{ marginLeft: '8px' }}>
                            ({selectedProduct.brand})
                          </Text>
                        </div>
                      }
                      style={{ marginTop: '16px' }}
                      extra={
                        <Space>
                          <Button
                            type='primary'
                            onClick={addSelectedVariantsToUpdate}
                            disabled={selectedVariants.length === 0}
                            icon={<PlusOutlined />}
                          >
                            Thêm {selectedVariants.length > 0 && `(${selectedVariants.length})`} vào danh sách
                          </Button>
                        </Space>
                      }
                    >
                      <Alert
                        message={`Biến thể sản phẩm (${selectedProduct.variants?.length || 0})`}
                        description='Chọn các biến thể bạn muốn cập nhật tồn kho'
                        type='info'
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />

                      <Table
                        dataSource={selectedProduct.variants}
                        columns={variantColumns}
                        rowKey='_id'
                        size='small'
                        scroll={{ y: 300 }}
                        pagination={
                          selectedProduct.variants?.length > 5
                            ? {
                                pageSize: 5,
                                size: 'small',
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20'],
                                showTotal: (total) => `Tổng ${total} biến thể`
                              }
                            : false
                        }
                        rowClassName={(record) =>
                          selectedVariants.some((v) => v._id === record._id) ? 'selected-row' : ''
                        }
                        summary={() => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={5}>
                              <div style={{ textAlign: 'right' }}>
                                <Text>
                                  Đã chọn: {selectedVariants.length}/{selectedProduct.variants?.length || 0} biến thể
                                </Text>
                              </div>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        )}
                      />
                    </Card>
                  )}
                </Card>
              )
            },
            {
              key: 'update',
              label: (
                <span>
                  <ImportOutlined />
                  Cập nhật tồn kho
                  {itemsToUpdate.length > 0 && <Badge count={itemsToUpdate.length} style={{ marginLeft: '8px' }} />}
                </span>
              ),
              children: (
                <Card bordered={false} className='update-list-card'>
                  {itemsToUpdate.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <ImportOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                      <div>
                        <Text type='secondary' style={{ fontSize: '16px' }}>
                          Chưa có sản phẩm nào trong danh sách cập nhật
                        </Text>
                      </div>
                      <div style={{ marginTop: '24px' }}>
                        <Button
                          type='primary'
                          onClick={() => {
                            setActiveTab('search');
                          }}
                        >
                          Tìm và thêm sản phẩm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Alert
                        message='Danh sách sản phẩm cần cập nhật tồn kho'
                        description='Nhập số lượng thay đổi (dương để thêm, âm để giảm). Ví dụ: nhập +5 để thêm 5 sản phẩm, nhập -3 để giảm 3 sản phẩm.'
                        type='info'
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />

                      <Table
                        dataSource={itemsToUpdate}
                        columns={updateListColumns}
                        rowKey='key'
                        pagination={false}
                        style={{ marginBottom: '24px' }}
                        bordered
                      />

                      <form>
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <div>
                              <label className='mb-1 block text-sm font-medium'>Lý do cập nhật</label>
                              <Controller
                                name='reason'
                                control={control}
                                rules={{ required: 'Vui lòng chọn lý do cập nhật' }}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    placeholder='Chọn lý do cập nhật'
                                    size='large'
                                    style={{ width: '100%' }}
                                  >
                                    <Option value='import'>Nhập hàng</Option>
                                    <Option value='export'>Xuất hàng</Option>
                                    <Option value='adjustment'>Điều chỉnh tồn kho</Option>
                                    <Option value='inventory'>Kiểm kê hàng hóa</Option>
                                    <Option value='other'>Khác</Option>
                                  </Select>
                                )}
                              />
                            </div>
                          </Col>
                        </Row>

                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                          <Button type='primary' icon={<SaveOutlined />} onClick={handleSave} size='large'>
                            Lưu thay đổi
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </Card>
              )
            }
          ]}
        />

        <Modal
          title='Xác nhận cập nhật hàng loạt'
          open={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          onOk={confirmBulkUpdate}
          confirmLoading={bulkUpdateLoading}
          width={600}
        >
          <Alert
            message='Cảnh báo'
            description='Thao tác này sẽ cập nhật số lượng tồn kho cho nhiều sản phẩm cùng lúc và không thể hoàn tác. Vui lòng kiểm tra kỹ các thay đổi của bạn.'
            type='warning'
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <div style={{ marginBottom: '16px' }}>
            <Typography.Text strong>Bạn sắp cập nhật {itemsToUpdate.length} sản phẩm:</Typography.Text>
            <ul>
              {itemsToUpdate
                .map((item) => (
                  <li key={item.key}>
                    {item.productName} - {item.size}/{item.color}:
                    <span style={{ color: item.currentStock < item.newStock ? 'green' : 'red' }}>
                      {item.currentStock} → {item.newStock} ({item.currentStock < item.newStock ? '+' : ''}
                      {item.newStock - item.currentStock})
                    </span>
                  </li>
                ))
                .slice(0, 5)}
              {itemsToUpdate.length > 5 && <li>...và {itemsToUpdate.length - 5} sản phẩm khác</li>}
            </ul>
          </div>

          <div>
            <Typography.Text type='danger'>Bạn có chắc chắn muốn tiếp tục không?</Typography.Text>
          </div>
        </Modal>
      </Spin>
    </div>
  );
};

export default BulkStockUpdate;
