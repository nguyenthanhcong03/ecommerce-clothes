import React from 'react';
import ProductItem from '../ProductItem/ProductItem';

function PopularProduct({ data }) {
  console.log(data);

  return (
    // <div className='mt-[10px] flex flex-wrap items-center justify-center gap-[10px]'>
    <>
      {data.map((item) => (
        <ProductItem
          key={item._id}
          src={item.images[0]}
          previewSrc={item.images[1]}
          name={item.name}
          price={item.price}
        />
      ))}
    </>
    // </div>
  );
}

export default PopularProduct;
