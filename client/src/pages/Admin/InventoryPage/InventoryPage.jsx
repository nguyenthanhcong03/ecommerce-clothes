import { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { WarningOutlined, HistoryOutlined, UploadOutlined } from '@ant-design/icons';
import LowStockProducts from './LowStockProducts';
import InventoryHistory from './InventoryHistory';
import BulkStockUpdate from './BulkStockUpdate';
import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import { motion } from 'framer-motion';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('lowStock');

  const items = [
    {
      key: 'lowStock',
      label: (
        <span>
          <WarningOutlined />
          Sản phẩm sắp hết hàng
        </span>
      ),
      children: <LowStockProducts />
    },
    {
      key: 'bulkUpdate',
      label: (
        <span>
          <UploadOutlined />
          Cập nhật hàng loạt
        </span>
      ),
      children: <BulkStockUpdate />
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          Lịch sử xuất nhập kho
        </span>
      ),
      children: <InventoryHistory />
    }
  ];

  useEffect(() => {
    document.title = 'Quản lý kho | Outfitory';
  }, []);

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý kho' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='site-card-border-less-wrapper'>
            <Card className='card-shadow'>
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default InventoryPage;
