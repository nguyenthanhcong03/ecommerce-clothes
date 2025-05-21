import Select from '@/components/common/Select/Select';
import React from 'react';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const SortSection = ({ currentCategory, viewMode, setViewMode, sortOptions, searchParams, onSortChange }) => {
  const { products, pagination } = useSelector((state) => state.product);
  return (
    <div className='mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white p-4 sm:flex-row sm:items-center'>
      <div className='text-sm text-gray-600'>
        <p>
          Hiển thị {products?.length || 0} trên {pagination?.total || 0} sản phẩm
          {currentCategory ? ` trong ${currentCategory.name}` : ''}
        </p>
      </div>

      <div className='flex items-center gap-4'>
        <div className='hidden items-center gap-2 lg:flex'>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-2 py-1 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
            aria-label='Grid view'
          >
            <AppstoreOutlined />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md px-2 py-1 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
            aria-label='List view'
          >
            <BarsOutlined />
          </button>
        </div>
        <Select
          options={sortOptions}
          placeholder='Sắp xếp theo'
          className='w-[200px]'
          value={(() => {
            const sortBy = searchParams.get('sortBy');
            const sortOrder = searchParams.get('sortOrder');
            if (!sortBy) return 'default';
            if (sortBy === 'price') return `price_${sortOrder}`;
            if (sortBy === 'name') return `name_${sortOrder}`;
            if (sortBy === 'rating') return 'rating_desc';
            if (sortBy === 'popularity') return 'popular';
            if (sortBy === 'createdAt' && sortOrder === 'desc') return 'newest';
            return 'default';
          })()}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
};

export default SortSection;
