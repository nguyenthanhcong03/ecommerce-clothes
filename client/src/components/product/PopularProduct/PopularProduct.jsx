import ProductCard from '@/components/product/ProductCard/ProductCard';
import React from 'react';

function PopularProduct({ data }) {
  return (
    <>
      {data.map((item) => (
        <ProductCard item={item} key={item._id} />
      ))}
    </>
  );
}

export default PopularProduct;
