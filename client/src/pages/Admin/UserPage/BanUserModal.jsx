import { Button, Form, Input, Modal } from 'antd';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

const BanUserModal = ({ isOpenBanModal, onCloseBanModal, onBan }) => {
  const { actionLoading } = useSelector((state) => state.adminUser);
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onBan(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    onCloseBanModal();
    form.resetFields();
  };

  return (
    <Modal
      title='Xác nhận chặn người dùng'
      open={isOpenBanModal}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' danger loading={actionLoading} onClick={handleOk}>
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

BanUserModal.propTypes = {
  isOpenBanModal: PropTypes.bool.isRequired,
  onCloseBanModal: PropTypes.func.isRequired,
  onBan: PropTypes.func.isRequired
};

export default BanUserModal;
