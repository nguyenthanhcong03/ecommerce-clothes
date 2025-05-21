import React from 'react';
import { StarFilled } from '@ant-design/icons';
import { formatCurrency } from '@/utils/format/formatCurrency';

const ProductItem = ({ product }) => {
  return (
    <div
      key={product._id}
      className='flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition hover:shadow-md md:flex-row'
    >
      <div className='relative h-60 md:h-auto md:w-1/3'>
        <img src={product.thumbnail || product.images[0]} alt={product.name} className='h-full w-full object-cover' />
        {product.discount > 0 && (
          <div className='absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white'>
            -{product.discount}%
          </div>
        )}
      </div>
      <div className='flex flex-col justify-between p-4 md:w-2/3'>
        <div>
          <h3 className='mb-2 text-lg font-semibold'>{product.name}</h3>
          <div className='mb-2 flex items-center'>
            <div className='flex text-yellow-400'>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarFilled
                  key={i}
                  className={i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className='ml-2 text-sm text-gray-600'>({product.totalReviews || 0} đánh giá)</span>
          </div>
          <p className='mb-4 line-clamp-2 text-sm text-gray-600'>{product.description}</p>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            {product.discount > 0 && (
              <span className='mr-2 text-gray-500 line-through'>{formatCurrency(product.price)}</span>
            )}
            <span className='text-primary-600 text-lg font-bold'>
              {formatCurrency(product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price)}
            </span>
          </div>
          <button className='bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 text-white transition'>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
