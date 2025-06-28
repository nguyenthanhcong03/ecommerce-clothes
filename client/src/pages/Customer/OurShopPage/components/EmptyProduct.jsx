import React from 'react';
import { TagOutlined, CloseOutlined } from '@ant-design/icons';
import Button from '@/components/common/Button/Button';

const EmptyProduct = ({ onResetFilter }) => {
  return (
    <div className='animate-fade-in flex flex-col items-center justify-center rounded-md bg-gray-50 py-16'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
        <TagOutlined style={{ fontSize: 32 }} className='text-gray-300' />
      </div>
      <h3 className='mb-2 text-xl font-medium text-gray-700'>Không tìm thấy sản phẩm</h3>
      <p className='mb-3 max-w-md text-center text-gray-500'>
        Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Vui lòng thử lại với các tiêu chí khác.
      </p>
      <div className='mt-2 flex gap-3'>
        <Button variant='primary' onClick={onResetFilter} aria-label='Xóa tất cả bộ lọc'>
          <CloseOutlined className='mr-1' /> Xóa bộ lọc
        </Button>
        <Button variant='secondary' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Quay lại đầu trang
        </Button>
      </div>
    </div>
  );
};

export default EmptyProduct;
