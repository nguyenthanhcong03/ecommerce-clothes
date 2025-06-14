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
          <Tag color={order.payment?.isPaid ? 'green' : 'volcano'} className='ml-2'>
            {order.payment?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
        </p>
        <p>
          <strong>Phương thức thanh toán:</strong> {order.payment?.method}
        </p>
        <p>
          <strong>Ngày đặt hàng:</strong> {formatDate(order.createdAt)}
        </p>
        {order.deliveredAt && (
          <p>
            <strong>Ngày giao hàng:</strong> {formatDate(order.deliveredAt)}
          </p>
        )}
        {order.cancelTime && (
          <p>
            <strong>Ngày hủy:</strong> {formatDate(order.cancelTime)}
          </p>
        )}
        {order.cancelReason && (
          <p>
            <strong>Lý do hủy:</strong> {order.cancelReason}
          </p>
        )}
      </div>

      <div className='mb-4'>
        <Title level={5}>Sản phẩm</Title>
        <Table
          dataSource={order.products}
          rowKey={(record) => record._id || record.productId}
          pagination={false}
          columns={[
            {
              title: 'Sản phẩm',
              key: 'product',
              render: (_, record) => (
                <div className='flex items-center'>
                  {record?.snapshot?.image && (
                    <img
                      src={record?.snapshot?.image}
                      alt={record?.snapshot?.name}
                      style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <div>{record?.snapshot?.name}</div>
                    {record?.snapshot && (
                      <div className='text-xs text-gray-500'>
                        {record?.snapshot?.size && `Size: ${record?.snapshot?.size}`}
                        {record?.snapshot?.size && record?.snapshot?.color && ` | `}
                        {record?.snapshot?.color && `Màu: ${record?.snapshot?.color}`}
                      </div>
                    )}
                  </div>
                </div>
              )
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              align: 'center',
              key: 'quantity'
            },
            {
              title: 'Đơn giá',
              key: 'price',
              align: 'right',
              render: (_, record) => formatCurrency(record.snapshot?.price || 0)
            },
            {
              title: 'Thành tiền',
              key: 'total',
              align: 'right',
              render: (_, record) => formatCurrency((record.snapshot?.price || 0) * record.quantity)
            }
          ]}
          summary={() => (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} index={0}>
                  <strong>Tổng phụ</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align='right'>
                  <strong>
                    {formatCurrency(
                      order.products.reduce((sum, item) => sum + (item.snapshot?.price || 0) * item.quantity, 0)
                    )}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              {order.discountAmount > 0 && (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3} index={0}>
                    <strong>Giảm giá</strong>
                    {order.couponApplied && <span className='ml-2 text-sm'>({order.couponApplied.code})</span>}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align='right'>
                    <strong className='text-red-500'>-{formatCurrency(order.discountAmount)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}

              {order.shippingFee > 0 && (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3} index={0}>
                    <strong>Phí vận chuyển</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align='right'>
                    <strong>{formatCurrency(order.shippingFee)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}

              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} index={0}>
                  <strong>Tổng thanh toán</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align='right'>
                  <strong className='text-xl text-red-600'>{formatCurrency(order.totalPrice)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )}
        />
      </div>

      {order.note && (
        <div className='mb-4'>
          <Title level={5}>Ghi chú</Title>
          <p>{order.note}</p>
        </div>
      )}

      {order.review && (
        <div className='mb-4'>
          <Title level={5}>Đánh giá</Title>
          <p>
            <strong>Đánh giá:</strong> {Array(order.review.rating).fill('★').join('')}
          </p>
          {order.review.comment && (
            <p>
              <strong>Nhận xét:</strong> {order.review.comment}
            </p>
          )}
          <p>
            <strong>Ngày đánh giá:</strong> {formatDate(order.review.reviewDate)}
          </p>
        </div>
      )}

      {order.trackingNumber && (
        <div className='mb-4'>
          <Title level={5}>Thông tin vận chuyển</Title>
          <p>
            <strong>Mã vận đơn:</strong> {order.trackingNumber}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
