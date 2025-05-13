import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { getOrderStatisticsAPI } from '@/services/orderService';
import { formatCurrency } from '@/utils/formatCurrency';
import { useSelector } from 'react-redux';

const OrderStatistics = () => {
  // Lấy summary từ adminOrderSlice nếu đang áp dụng bộ lọc
  const { summary, filters } = useSelector((state) => state.adminOrder);
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu có bộ lọc đang áp dụng, sử dụng dữ liệu từ summary
    if (hasActiveFilters && summary) {
      setStats((prevStats) => ({
        ...prevStats,
        totalOrders: summary.totalOrders || 0,
        totalRevenue: summary.totalRevenue || 0
      }));
      setLoading(false);
      return;
    }

    // Nếu không có bộ lọc, lấy thông tin thống kê tổng quan
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await getOrderStatisticsAPI();
        setStats({
          totalOrders: response.data.totalOrders || 0,
          pendingOrders: response.data.ordersByStatus?.find((item) => item._id === 'Pending')?.count || 0,
          deliveredOrders: response.data.ordersByStatus?.find((item) => item._id === 'Delivered')?.count || 0,
          cancelledOrders: response.data.ordersByStatus?.find((item) => item._id === 'Cancelled')?.count || 0,
          totalRevenue: response.data.totalRevenue || 0
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu thống kê');
        console.error('Error fetching order statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [hasActiveFilters, summary]);

  if (loading) {
    return (
      <div className='py-10 text-center'>
        <Spin tip='Đang tải dữ liệu thống kê...' />
      </div>
    );
  }

  if (error) {
    return <Alert message='Lỗi khi tải dữ liệu thống kê' description={error} type='error' showIcon className='mb-6' />;
  }
  // Xác định xem có đang áp dụng bộ lọc hay không
  const filterNotice = hasActiveFilters ? ' (theo bộ lọc)' : '';

  return (
    <Row gutter={16} className='mb-6'>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`Tổng số đơn hàng${filterNotice}`}
            value={stats.totalOrders}
            valueStyle={{ color: '#3f8600' }}
            prefix={<ShoppingOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6} style={{ display: hasActiveFilters ? 'none' : 'block' }}>
        <Card>
          <Statistic
            title='Đơn hàng chờ xử lý'
            value={stats.pendingOrders}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>{' '}
      </Col>
      <Col xs={24} sm={12} lg={6} style={{ display: hasActiveFilters ? 'none' : 'block' }}>
        <Card>
          <Statistic
            title='Đơn hàng đã giao'
            value={stats.deliveredOrders}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={hasActiveFilters ? 12 : 6}>
        <Card>
          <Statistic
            title={`Doanh thu${filterNotice}`}
            value={stats.totalRevenue}
            valueStyle={{ color: '#1890ff' }}
            prefix={<DollarOutlined />}
            formatter={(value) => `${formatCurrency(value)}`}
          />
        </Card>
      </Col>

      {/* Thống kê đơn hàng hủy */}
      <Col xs={24} sm={12} lg={6} className='mt-4' style={{ display: hasActiveFilters ? 'none' : 'block' }}>
        <Card>
          <Statistic
            title='Đơn hàng đã hủy'
            value={stats.cancelledOrders}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<StopOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default OrderStatistics;
