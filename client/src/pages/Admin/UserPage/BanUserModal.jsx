import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

const BanUserModal = ({ visible, onClose, onConfirm, loading }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onConfirm(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title='Xác nhận chặn người dùng'
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' danger loading={loading} onClick={handleOk}>
          Chặn người dùng
        </Button>
      ]}
    >
      <Form form={form} layout='vertical' initialValues={{ reason: '' }}>
        <p className='mb-4'>
          Bạn có chắc chắn muốn chặn người dùng này? Người dùng sẽ không thể đăng nhập và sử dụng hệ thống.
        </p>

        <Form.Item name='reason' label='Lý do chặn (tùy chọn)'>
          <Input.TextArea rows={3} placeholder='Nhập lý do chặn người dùng...' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BanUserModal;
