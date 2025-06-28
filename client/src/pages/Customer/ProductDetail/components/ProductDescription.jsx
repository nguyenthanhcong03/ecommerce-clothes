import Collapse from '@/components/common/Collapse/Collapse';
import React from 'react';

const ProductDescription = ({ product }) => {
  return (
    <div className='mt-4 flex flex-col gap-2 rounded-sm bg-white p-4'>
      <Collapse title='CHI TIẾT SẢN PHẨM' className='bg-[#FAFAFA]' isShow={true}>
        <div className='space-y-4 rounded p-3 text-xs sm:space-y-6 sm:p-4 sm:text-sm'>
          {/* Thông tin danh mục và thương hiệu */}
          <div className='grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-4'>
            <h4 className='text-[#888888]'>Danh mục</h4>
            <p className='col-span-2 sm:col-span-3'>{product.categoryId?.name}</p>
          </div>
          <div className='grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-4'>
            <h4 className='text-[#888888]'>Thương hiệu</h4>
            <p className='col-span-2 sm:col-span-3'>{product.brand}</p>
          </div>

          {/* Thông tin các biến thể */}
          <div className='grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-4'>
            <h4 className='text-[#888888]'>Kích thước có sẵn</h4>
            <div className='col-span-2 flex flex-wrap gap-1 sm:col-span-3 sm:gap-2'>
              {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => (
                <span key={size} className='rounded bg-gray-100 px-2 py-0.5 text-xs sm:px-3 sm:py-1'>
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-4'>
            <h4 className='text-[#888888]'>Màu sắc có sẵn</h4>
            <div className='col-span-2 flex flex-wrap gap-1 sm:col-span-3 sm:gap-2'>
              {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => (
                <span key={color} className='rounded bg-gray-100 px-2 py-0.5 text-xs sm:px-3 sm:py-1'>
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-4'>
            <h4 className='text-[#888888]'>Số lượng sản phẩm</h4>
            <p className='col-span-2 sm:col-span-3'>
              Tổng số: {product.variants.reduce((sum, variant) => sum + variant.stock, 0)} sản phẩm
            </p>
          </div>
        </div>
      </Collapse>
      <Collapse title='MÔ TẢ SẢN PHẨM' className='bg-[#FAFAFA]' isShow={true}>
        <div className='rounded bg-white p-3 sm:p-4'>
          <div className='prose prose-sm max-w-none whitespace-pre-line text-xs sm:text-sm'>{product?.description}</div>
        </div>
      </Collapse>
    </div>
  );
};

export default ProductDescription;
