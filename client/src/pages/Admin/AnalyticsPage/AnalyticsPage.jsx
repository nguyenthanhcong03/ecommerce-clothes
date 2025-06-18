import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as statisticsService from '@/services/statisticsService';
import { Select, Tabs } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
  SkinOutlined,
  HddOutlined
} from '@ant-design/icons';
import AdminHeader from '@/components/AdminComponents/common/AdminHeader';

const AnalyticsPage = () => {
  // State cho chọn khoảng thời gian
  const [timeRange, setTimeRange] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // State cho dữ liệu thống kê
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [topProductsData, setTopProductsData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Fetch dữ liệu khi chọn khoảng thời gian
  useEffect(() => {
    const fetchStatisticsData = async () => {
      setLoading(true);
      try {
        // Chuẩn bị params
        const params = {
          period: timeRange
        };

        if (timeRange === 'custom') {
          params.startDate = customDateRange.startDate;
          params.endDate = customDateRange.endDate;
        }

        // Fetch dữ liệu tổng quan
        const overviewResponse = await statisticsService.getOverviewStatistics();
        setOverviewData(overviewResponse.statistics);

        // Fetch dữ liệu doanh thu
        const revenueResponse = await statisticsService.getRevenueStatistics(
          timeRange,
          params.startDate,
          params.endDate
        );
        setRevenueData(revenueResponse.statistics);

        // Fetch dữ liệu sản phẩm bán chạy
        const topProductsResponse = await statisticsService.getTopProducts(
          10,
          timeRange,
          params.startDate,
          params.endDate
        );
        console.log('topProductsResponse', topProductsResponse);
        setTopProductsData(topProductsResponse.products);

        // Fetch dữ liệu khách hàng
        const customerResponse = await statisticsService.getCustomerStatistics(
          timeRange,
          params.startDate,
          params.endDate
        );
        setCustomerData(customerResponse.statistics);

        // Fetch dữ liệu danh mục
        const categoryResponse = await statisticsService.getCategoryStatistics(
          timeRange,
          params.startDate,
          params.endDate
        );
        setCategoryData(categoryResponse.statistics);

        // Fetch dữ liệu đơn hàng
        const orderResponse = await statisticsService.getOrderStatistics(timeRange, params.startDate, params.endDate);
        setOrderData(orderResponse.statistics);

        // Fetch dữ liệu tồn kho
        const inventoryResponse = await statisticsService.getInventoryStatistics();
        setInventoryData(inventoryResponse.statistics);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatisticsData();
  }, [timeRange, customDateRange]);

  // Format tiền VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // Xử lý thay đổi ngày tùy chỉnh
  const handleCustomDateChange = (type, value) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [type]: value
    }));
  };

  // Components các mục thống kê
  const renderOverviewStats = () => {
    if (!overviewData) return <div className='loading'>Đang tải...</div>;

    return (
      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Tổng doanh thu</p>
              <h3 className='text-2xl font-bold'>{formatCurrency(overviewData.totalRevenue)}</h3>
            </div>
            <div className='rounded-full bg-blue-100 p-3 text-blue-500'>
              <DollarOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Tổng đơn hàng</p>
              <h3 className='text-2xl font-bold'>{overviewData.totalOrders}</h3>
            </div>
            <div className='rounded-full bg-green-100 p-3 text-green-500'>
              <ShoppingOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Tổng khách hàng</p>
              <h3 className='text-2xl font-bold'>{overviewData.totalCustomers}</h3>
            </div>
            <div className='rounded-full bg-purple-100 p-3 text-purple-500'>
              <UserOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Tổng sản phẩm</p>
              <h3 className='text-2xl font-bold'>{overviewData.totalProducts}</h3>
            </div>
            <div className='rounded-full bg-orange-100 p-3 text-orange-500'>
              <AppstoreOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueStats = () => {
    if (!revenueData) return <div className='loading'>Đang tải...</div>;

    const formattedData = revenueData.revenueByTime.map((item) => ({
      ...item,
      revenue: Number(item.revenue) // Đảm bảo revenue là số
    }));

    const paymentMethodData = revenueData.revenueByPaymentMethod.map((item) => ({
      name: item._id,
      value: item.revenue
    }));

    return (
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Doanh thu theo thời gian</h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='_id' />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(value) => `Thời gian: ${value}`}
              />
              <Legend />
              <Line type='monotone' dataKey='revenue' stroke='#8884d8' activeDot={{ r: 8 }} name='Doanh thu' />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Doanh thu theo phương thức thanh toán</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                nameKey='name'
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTopProductsStats = () => {
    if (!topProductsData) return <div className='loading'>Đang tải...</div>;

    return (
      <div className='mb-8 rounded-lg bg-white p-4 shadow'>
        <h3 className='mb-4 text-lg font-semibold'>Top 10 sản phẩm bán chạy</h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart data={topProductsData} layout='vertical' margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' />
            <YAxis type='category' dataKey='name' width={100} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'totalSold') return [`${value} sản phẩm`, 'Đã bán'];
                if (name === 'totalRevenue') return [formatCurrency(value), 'Doanh thu'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey='totalSold' fill='#8884d8' name='Số lượng đã bán' />
            <Bar dataKey='totalRevenue' fill='#82ca9d' name='Doanh thu' />
          </BarChart>
        </ResponsiveContainer>

        <div className='mt-6'>
          <h4 className='text-md mb-2 font-semibold'>Chi tiết sản phẩm bán chạy</h4>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Sản phẩm
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Danh mục
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Số lượng bán
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {topProductsData.map((product, index) => (
                  <tr key={product._id || index}>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex items-center'>
                        {product.image && (
                          <div className='mr-4 h-10 w-10 flex-shrink-0'>
                            <img className='h-10 w-10 rounded-md object-cover' src={product.image} alt={product.name} />
                          </div>
                        )}
                        <div>
                          <div className='text-sm font-medium text-gray-900'>{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{product.categoryName}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{product.totalSold}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryStats = () => {
    if (!categoryData) return <div className='loading'>Đang tải...</div>;

    const pieData = categoryData.map((cat) => ({
      name: cat.name || 'Không xác định',
      value: cat.totalRevenue
    }));

    return (
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Doanh thu theo danh mục</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                nameKey='name'
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Chi tiết theo danh mục</h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Danh mục
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Số lượng bán
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {categoryData.map((category, index) => (
                  <tr key={category._id || index}>
                    <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                      {category.name || 'Không xác định'}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{category.totalSold}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {formatCurrency(category.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderStats = () => {
    if (!orderData) return <div className='loading'>Đang tải...</div>;

    const orderStatusData = orderData.ordersByStatus.map((status) => ({
      name: status._id,
      value: status.count
    }));

    return (
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Đơn hàng theo trạng thái</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                nameKey='name'
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Đơn hàng theo thời gian</h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={orderData.ordersByTime}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='_id' />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'count') return [value, 'Số đơn hàng'];
                  if (name === 'revenue') return [formatCurrency(value), 'Doanh thu'];
                  return [value, name];
                }}
                labelFormatter={(value) => `Thời gian: ${value}`}
              />
              <Legend />
              <Line type='monotone' dataKey='count' stroke='#8884d8' activeDot={{ r: 8 }} name='Số đơn hàng' />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='col-span-1 rounded-lg bg-white p-4 shadow lg:col-span-2'>
          <h3 className='mb-4 text-lg font-semibold'>Tỷ lệ hủy đơn: {orderData.cancellationRate.toFixed(2)}%</h3>
          {orderData.topCancellationReasons.length > 0 && (
            <div>
              <h4 className='text-md mb-2 font-semibold'>Top lý do hủy đơn:</h4>
              <ul className='list-disc pl-5'>
                {orderData.topCancellationReasons.map((reason, index) => (
                  <li key={index} className='mb-1'>
                    {reason._id}: <span className='font-medium'>{reason.count} đơn</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInventoryStats = () => {
    if (!inventoryData) return <div className='loading'>Đang tải...</div>;

    const stockDistributionData = inventoryData.stockDistribution.map((item) => ({
      name: item.stockLevel,
      value: item.uniqueProductCount
    }));

    return (
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Phân bố tồn kho</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={stockDistributionData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                nameKey='name'
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {stockDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-4 shadow'>
          <h3 className='mb-4 text-lg font-semibold'>Tổng quan tồn kho</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between rounded bg-gray-50 p-3'>
              <span>Tổng số sản phẩm:</span>
              <span className='font-bold'>{inventoryData.totalProducts}</span>
            </div>
            <div className='flex items-center justify-between rounded bg-gray-50 p-3'>
              <span>Tổng số lượng tồn kho:</span>
              <span className='font-bold'>{inventoryData.totalInventory} đơn vị</span>
            </div>
            <div className='flex items-center justify-between rounded bg-gray-50 p-3'>
              <span>Sản phẩm gần hết hàng:</span>
              <span className='font-bold text-yellow-500'>{inventoryData.lowStockProducts.length} sản phẩm</span>
            </div>
            <div className='flex items-center justify-between rounded bg-gray-50 p-3'>
              <span>Sản phẩm đã hết hàng:</span>
              <span className='font-bold text-red-500'>{inventoryData.outOfStockProducts.length} sản phẩm</span>
            </div>
          </div>
        </div>

        {inventoryData.lowStockProducts.length > 0 && (
          <div className='col-span-1 rounded-lg bg-white p-4 shadow lg:col-span-2'>
            <h3 className='mb-4 text-lg font-semibold'>Sản phẩm gần hết hàng</h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Sản phẩm
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Biến thể
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Số lượng tồn
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {inventoryData.lowStockProducts.slice(0, 10).map((product) =>
                    product.variants.map((variant, vIndex) => (
                      <tr key={`${product._id}-${vIndex}`}>
                        {vIndex === 0 && (
                          <td
                            className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'
                            rowSpan={product.variants.length}
                          >
                            {product.name}
                          </td>
                        )}
                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                          {variant.color} - {variant.size} (SKU: {variant.sku})
                        </td>
                        <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-yellow-500'>
                          {variant.stock}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomerStats = () => {
    if (!customerData) return <div className='loading'>Đang tải...</div>;

    return (
      <div className='mb-8 grid grid-cols-1 gap-6'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Thống kê khách hàng</h3>
            <div className='rounded bg-purple-100 p-2 text-purple-500'>
              <span className='font-bold'>{customerData.newCustomers}</span> khách hàng mới
            </div>
          </div>

          <div className='mt-6'>
            <h4 className='text-md mb-4 font-semibold'>Top khách hàng mua nhiều nhất</h4>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Khách hàng
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Số điện thoại
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Số đơn hàng
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Tổng chi tiêu
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {customerData.topCustomersByOrders.map((customer, index) => (
                    <tr key={customer._id || index}>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {customer.firstName} {customer.lastName}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.email}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.phone}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.orderCount}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                        {formatCurrency(customer.totalSpent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='mt-10'>
            <h4 className='text-md mb-4 font-semibold'>Top khách hàng chi tiêu nhiều nhất</h4>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Khách hàng
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Số điện thoại
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Số đơn hàng
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Tổng chi tiêu
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {customerData.topCustomersBySpending.map((customer, index) => (
                    <tr key={customer._id || index}>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {customer.firstName} {customer.lastName}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.email}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.phone}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{customer.orderCount}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                        {formatCurrency(customer.totalSpent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Time range selector
  const renderTimeRangeSelector = () => {
    return (
      <div className='mb-6 rounded-lg bg-white p-4 shadow'>
        <div className='flex flex-wrap items-center justify-between'>
          <h3 className='mb-4 text-lg font-semibold md:mb-0'>Khoảng thời gian</h3>

          <div className='flex flex-wrap items-center gap-4'>
            <Select
              value={timeRange}
              style={{ width: 120 }}
              onChange={handleTimeRangeChange}
              options={[
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
                { value: 'year', label: 'Năm nay' },
                { value: 'custom', label: 'Tùy chỉnh' }
              ]}
            />

            {timeRange === 'custom' && (
              <div className='flex flex-wrap items-center gap-2'>
                <input
                  type='date'
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className='rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <span>đến</span>
                <input
                  type='date'
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  className='rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tab items for different statistics
  const tabItems = [
    {
      key: '1',
      label: (
        <span className='flex items-center'>
          <DollarOutlined />
          <span className='ml-2'>Tổng quan</span>
        </span>
      ),
      children: (
        <>
          {renderOverviewStats()}
          {renderRevenueStats()}
        </>
      )
    },
    {
      key: '2',
      label: (
        <span className='flex items-center'>
          <ShoppingOutlined />
          <span className='ml-2'>Đơn hàng</span>
        </span>
      ),
      children: renderOrderStats()
    },
    {
      key: '3',
      label: (
        <span className='flex items-center'>
          <SkinOutlined />
          <span className='ml-2'>Sản phẩm</span>
        </span>
      ),
      children: renderTopProductsStats()
    },
    {
      key: '4',
      label: (
        <span className='flex items-center'>
          <AppstoreOutlined />
          <span className='ml-2'>Danh mục</span>
        </span>
      ),
      children: renderCategoryStats()
    },
    {
      key: '5',
      label: (
        <span className='flex items-center'>
          <UserOutlined />
          <span className='ml-2'>Khách hàng</span>
        </span>
      ),
      children: renderCustomerStats()
    },
    {
      key: '6',
      label: (
        <span className='flex items-center'>
          <HddOutlined />
          <span className='ml-2'>Tồn kho</span>
        </span>
      ),
      children: renderInventoryStats()
    }
  ];

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Thống kê doanh số' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        {renderTimeRangeSelector()}

        {loading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500'></div>
          </div>
        ) : (
          <Tabs defaultActiveKey='1' items={tabItems} />
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
