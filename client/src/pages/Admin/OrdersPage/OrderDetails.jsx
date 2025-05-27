import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { formatDate } from '@/utils/format/formatDate';
import { formatCurrency } from '../../../utils/format/formatCurrency';

const { Title } = Typography;

const statusColors = {
  Processing: 'blue',
  Shipping: 'cyan',
  Delivered: 'green',
  Cancelled: 'red'
};

const OrderDetails = ({ order }) => {
  if (!order) return null;

  return (
    <div>
      <div className='mb-4'>
        <Title level={5}>Thông tin khách hàng</Title>
        <p>
          <strong>Tên:</strong> {order.shippingAddress?.fullName}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {order.shippingAddress?.address}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {order.shippingAddress?.phoneNumber}
        </p>
      </div>

      <div className='mb-4'>
        <Title level={5}>Thông tin đơn hàng</Title>
        <p>
          <strong>Trạng thái:</strong>
          <Tag color={statusColors[order.status]} className='ml-2'>
            {order.status}
          </Tag>
        </p>
        <p>
          <strong>Thanh toán:</strong>
          <Tag color={order.isPaid ? 'green' : 'volcano'} className='ml-2'>
            {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
        </p>
        <p>
          <strong>Phương thức thanh toán:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Ngày đặt hàng:</strong> {formatDate(order.createdAt)}
        </p>
      </div>

      <div className='mb-4'>
        <Title level={5}>Sản phẩm</Title>
        <Table
          dataSource={order.orderItems}
          rowKey='_id'
          pagination={false}
          columns={[
            {
              title: 'Sản phẩm',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <div className='flex items-center'>
                  {record.image && (
                    <img
                      src={record.image}
                      alt={text}
                      style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }}
                    />
                  )}
                  <span>{text}</span>
                </div>
              )
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity'
            },
            {
              title: 'Đơn giá',
              dataIndex: 'price',
              key: 'price',
              render: (price) => formatCurrency(price)
            },
            {
              title: 'Thành tiền',
              key: 'total',
              render: (_, record) => formatCurrency(record.price * record.quantity)
            }
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={3} index={0}>
                <strong>Tổng tiền</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>{formatCurrency(order.totalPrice)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>

      {order.note && (
        <div className='mb-4'>
          <Title level={5}>Ghi chú</Title>
          <p>{order.note}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
