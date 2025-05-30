import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Modal, List, Typography, Space, Tag, Row, Col } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  })
    .format(amount)
    .replace('₫', 'đ');
};

const UnavailableItemsModal = ({ visible, unavailableItems, onRemoveItems, onKeepItems, onCancel }) => {
  const navigate = useNavigate();

  // Tổng giá trị của các sản phẩm không khả dụng
  const totalUnavailableValue = unavailableItems?.reduce(
    (total, item) => total + item.snapshot.price * item.quantity,
    0
  );

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <Typography.Text strong>Có sản phẩm không khả dụng trong giỏ hàng</Typography.Text>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='browse' onClick={() => navigate('/shop')}>
          Tiếp tục mua sắm
        </Button>,
        <Button key='keep' onClick={onKeepItems}>
          Giữ tất cả sản phẩm
        </Button>,
        <Button key='remove' type='primary' danger onClick={onRemoveItems}>
          Xóa sản phẩm không khả dụng
        </Button>
      ]}
      width={600}
    >
      <div className='mb-4'>
        <Typography.Paragraph>
          Một số sản phẩm trong giỏ hàng của bạn hiện không khả dụng. Có thể chúng đã hết hàng hoặc đã bị gỡ bỏ.
        </Typography.Paragraph>
        <Typography.Paragraph type='warning'>
          Những sản phẩm này sẽ không được đặt hàng khi bạn tiến hành thanh toán.
        </Typography.Paragraph>
      </div>

      <List
        itemLayout='horizontal'
        dataSource={unavailableItems}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <img
                  src={item.snapshot.image}
                  alt={item.snapshot.name}
                  style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
              }
              title={<Typography.Text>{item.snapshot.name}</Typography.Text>}
              description={
                <Space direction='vertical' size={0}>
                  <Typography.Text type='secondary'>{`${item.snapshot.color}, ${item.snapshot.size}`}</Typography.Text>
                  <Typography.Text type='secondary'>Số lượng: {item.quantity}</Typography.Text>
                  <Typography.Text type='secondary'>Đơn giá: {formatCurrency(item.snapshot.price)}</Typography.Text>
                  <Tag color='error'>Không khả dụng</Tag>
                </Space>
              }
            />
            <div>
              <Typography.Text strong>{formatCurrency(item.snapshot.price * item.quantity)}</Typography.Text>
            </div>
          </List.Item>
        )}
      />

      <Row className='mt-4'>
        <Col span={12}>
          <Typography.Text strong>Tổng giá trị sản phẩm không khả dụng:</Typography.Text>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Typography.Text strong>{formatCurrency(totalUnavailableValue || 0)}</Typography.Text>
        </Col>
      </Row>
    </Modal>
  );
};

export default UnavailableItemsModal;
