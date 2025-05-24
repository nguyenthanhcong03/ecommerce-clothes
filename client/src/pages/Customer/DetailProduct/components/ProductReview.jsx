import Collapse from '@/components/common/Collapse/Collapse';
import React from 'react';

const ProductReview = ({ product }) => {
  <div className='mt-4 flex flex-col gap-2 rounded-sm bg-white p-4'>
    <Collapse title='ĐÁNH GIÁ SẢN PHẨM' className='bg-[#FAFAFA]' isShow={true}>
      <div className='rounded bg-white p-3 sm:p-4'>
        <div className='prose prose-sm max-w-none whitespace-pre-line text-xs sm:text-sm'>{product.description}</div>
      </div>
    </Collapse>
  </div>;
};

export default ProductReview;
