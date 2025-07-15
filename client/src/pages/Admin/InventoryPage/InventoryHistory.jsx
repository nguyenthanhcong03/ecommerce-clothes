import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  DatePicker,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Tooltip,
  Spin,
  AutoComplete
} from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventoryHistory,
  setFilters,
  resetFilters,
  setPage,
  setLimit
} from '../../../store/slices/inventoryHistorySlice';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import './InventoryHistory.scss';
import { searchProductsAPI } from '../../../services/productService';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryHistory = () => {
  const dispatch = useDispatch();
  const { inventoryHistory, pagination, loading, filters } = useSelector((state) => state.inventoryHistory);
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      sku: '',
      type: '',
      dateRange: null,
      productId: null
    }
  });

  useEffect(() => {
    loadInventoryHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  const loadInventoryHistory = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
      sku: filters.sku || '',
      type: filters.type || '',
      productId: filters.productId || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || ''
    };

    // Loại bỏ các tham số undefined hoặc rỗng
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });

    dispatch(fetchInventoryHistory(queryParams));
  }, [pagination.page, pagination.limit, filters, dispatch]);

  const onSubmit = (data) => {
    console.log('data', data);
    const newFilters = {
      sku: data.sku,
      type: data.type,
      productId: data.productId,
      startDate: data.dateRange?.[0] ? dayjs(data.dateRange[0]).format('YYYY-MM-DD') : null,
      endDate: data.dateRange?.[1] ? dayjs(data.dateRange[1]).format('YYYY-MM-DD') : null
    };

    // Reset về trang 1 khi áp dụng bộ lọc mới
    dispatch(setPage(1));
    dispatch(setFilters(newFilters));
  };

  const resetForm = () => {
    reset({
      sku: '',
      type: '',
      dateRange: null,
      productId: null
    });

    // Reset về trang 1 và xóa bộ lọc
    dispatch(setPage(1));
    dispatch(resetFilters());
  };

  const handleTableChange = (pagination, tableFilters, sorter) => {
    // Cập nhật trang và giới hạn dòng hiển thị
    dispatch(setPage(pagination.current));
    dispatch(setLimit(pagination.pageSize));

    // Cập nhật sắp xếp nếu có
    if (sorter.field && sorter.order) {
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      dispatch(
        setFilters({
          sortBy: sorter.field,
          sortOrder
        })
      );
    }
  };

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: true,
      width: 150
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['productId', 'name'],
      key: 'productName',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text, record) => (
        <Tooltip placement='topLeft' title={record.productId?.name || 'N/A'}>
          {record.productId?.name || 'N/A'}
        </Tooltip>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        let color = 'blue';
        let typeText = 'Điều chỉnh';
        if (type === 'import') {
          color = 'green';
          typeText = 'Nhập kho';
        }
        if (type === 'export') {
          color = 'red';
          typeText = 'Xuất kho';
        }

        return <Tag color={color}>{typeText}</Tag>;
      },
      filters: [
        { text: 'Nhập kho', value: 'import' },
        { text: 'Xuất kho', value: 'export' },
        { text: 'Điều chỉnh', value: 'adjustment' }
      ],
      sorter: true
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      sorter: true,
      render: (quantity, record) => {
        const color = record.type === 'export' ? 'red' : record.type === 'import' ? 'green' : '';
        return <span style={{ color }}>{quantity}</span>;
      }
    },
    {
      title: 'Tồn kho trước',
      dataIndex: 'previousStock',
      key: 'previousStock',
      width: 120,
      sorter: true
    },
    {
      title: 'Tồn kho sau',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      sorter: true
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (reason) => {
        switch (reason) {
          case 'import':
            return (
              <Tooltip placement='topLeft' title={'Nhập hàng'}>
                Nhập hàng
              </Tooltip>
            );
          case 'export':
            return (
              <Tooltip placement='topLeft' title={'Xuất hàng'}>
                Xuất hàng
              </Tooltip>
            );
          case 'adjustment':
            return (
              <Tooltip placement='topLeft' title={'Điều chỉnh tồn kho'}>
                Điều chỉnh tồn kho
              </Tooltip>
            );
        }
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (notes) =>
        notes ? (
          <Tooltip placement='topLeft' title={notes}>
            {notes}
          </Tooltip>
        ) : (
          '-'
        )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 150,
      render: (performedBy) => {
        return performedBy ? (
          <Tooltip placement='topLeft' title={`${performedBy.firstName || ''} ${performedBy.lastName || ''}`}>
            {performedBy.lastName || ''} {performedBy.firstName || ''}
          </Tooltip>
        ) : (
          'N/A'
        );
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: true
    }
  ];

  return (
    <Card title={<Title level={4}>Lịch Sử Xuất Nhập Kho</Title>} className='inventory-history-card'>
      <Form onFinish={handleSubmit(onSubmit)} layout='vertical'>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item label='Mã SKU'>
              <Controller
                name='sku'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Tìm theo mã SKU' />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item label='Loại giao dịch'>
              <Controller
                name='type'
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder='Chọn loại giao dịch' allowClear>
                    <Option value='import'>Nhập kho</Option>
                    <Option value='export'>Xuất kho</Option>
                    <Option value='adjustment'>Điều chỉnh</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item label='Khoảng thời gian'>
              <Controller
                name='dateRange'
                control={control}
                render={({ field }) => (
                  <RangePicker
                    {...field}
                    style={{ width: '100%' }}
                    format='DD/MM/YYYY'
                    presets={[
                      {
                        label: 'Hôm nay',
                        value: [dayjs().startOf('day'), dayjs().endOf('day')]
                      },
                      {
                        label: '7 ngày qua',
                        value: [dayjs().subtract(7, 'day'), dayjs()]
                      },
                      {
                        label: '30 ngày qua',
                        value: [dayjs().subtract(30, 'day'), dayjs()]
                      },
                      {
                        label: 'Tháng này',
                        value: [dayjs().startOf('month'), dayjs().endOf('month')]
                      },
                      {
                        label: 'Tháng trước',
                        value: [
                          dayjs().subtract(1, 'month').startOf('month'),
                          dayjs().subtract(1, 'month').endOf('month')
                        ]
                      }
                    ]}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify='end' gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button icon={<ClearOutlined />} onClick={resetForm}>
                Xóa bộ lọc
              </Button>
              <Button type='primary' icon={<SearchOutlined />} htmlType='submit'>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => loadInventoryHistory()} loading={loading}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <Spin spinning={loading} tip='Đang tải...'>
        <Table
          columns={columns}
          dataSource={inventoryHistory}
          rowKey='_id'
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          summary={(pageData) => {
            if (pageData.length === 0) return null;

            let totalImport = 0;
            let totalExport = 0;

            pageData.forEach((record) => {
              if (record.type === 'import') {
                totalImport += record.quantity;
              } else if (record.type === 'export') {
                totalExport += record.quantity;
              }
            });

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align='right'>
                    <strong>Tổng trên trang này:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <span style={{ color: 'green' }}>Nhập kho: {totalImport}</span>
                    <br />
                    <span style={{ color: 'red' }}>Xuất kho: {totalExport}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} colSpan={6} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
          locale={{
            emptyText: 'Không có dữ liệu',
            filterConfirm: 'Đồng ý',
            filterReset: 'Đặt lại',
            filterEmptyText: 'Không có bộ lọc',
            filterCheckall: 'Chọn tất cả',
            filterSearchPlaceholder: 'Tìm kiếm trong bộ lọc',
            selectAll: 'Chọn tất cả',
            selectInvert: 'Đảo ngược lựa chọn',
            selectNone: 'Bỏ chọn tất cả',
            selectionAll: 'Chọn tất cả dữ liệu',
            sortTitle: 'Sắp xếp',
            expand: 'Mở rộng hàng',
            collapse: 'Thu gọn hàng',
            triggerDesc: 'Nhấp để sắp xếp giảm dần',
            triggerAsc: 'Nhấp để sắp xếp tăng dần',
            cancelSort: 'Nhấp để hủy sắp xếp'
          }}
        />
      </Spin>
    </Card>
  );
};

export default InventoryHistory;
