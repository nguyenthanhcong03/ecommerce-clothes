import ProductCard from '@/components/product/ProductCard/ProductCard';
import React from 'react';

function PopularProduct({ data }) {
  return (
    // <div className='mt-[10px] flex flex-wrap items-center justify-center gap-[10px]'>
    <>
      {data.map((item) => (
        <ProductCard item={item} key={item._id} isShowVariant={false} />
      ))}
    </>
    // </div>
  );
}

export default PopularProduct;
