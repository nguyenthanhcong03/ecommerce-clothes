import React from 'react';
import { Modal, Button, Table } from 'antd';
import { formatCurrency } from '@/utils/format/formatCurrency';

const PriceChangeModal = ({ visible, changedProducts, onCancel, onConfirm }) => {
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          {text}
          {record.variantName && <span className='text-gray-500'> ({record.variantName})</span>}
        </div>
      )
    },
    {
      title: 'Giá cũ',
      dataIndex: 'oldPrice',
      key: 'oldPrice',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Giá mới',
      dataIndex: 'newPrice',
      key: 'newPrice',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Chênh lệch',
      key: 'difference',
      render: (_, record) => {
        const diff = record.newPrice - record.oldPrice;
        return (
          <span className={diff > 0 ? 'text-red-500' : 'text-green-500'}>
            {diff > 0 ? '+' : ''}
            {formatCurrency(diff)}
          </span>
        );
      }
    }
  ];

  return (
    <Modal
      title='Giá sản phẩm đã thay đổi'
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='back' onClick={onCancel}>
          Hủy đặt hàng
        </Button>,
        <Button key='submit' type='primary' onClick={onConfirm}>
          Tiếp tục với giá mới
        </Button>
      ]}
      width={700}
    >
      <div className='mb-4'>
        <p className='font-medium text-red-500'>Giá một số sản phẩm đã thay đổi kể từ khi bạn thêm vào giỏ hàng.</p>
        <p>Vui lòng xem lại và xác nhận nếu bạn muốn tiếp tục đặt hàng với giá mới.</p>
      </div>

      <Table
        columns={columns}
        dataSource={changedProducts.map((product, index) => ({
          ...product,
          key: index
        }))}
        pagination={false}
      />
    </Modal>
  );
};

export default PriceChangeModal;
