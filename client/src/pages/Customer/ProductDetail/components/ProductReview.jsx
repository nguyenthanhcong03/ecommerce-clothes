import Collapse from '@/components/common/Collapse/Collapse';
import ReviewList from '@/pages/customer/ProductDetail/components/ReviewList/ReviewList';
import ReviewStatistics from '@/pages/customer/ProductDetail/components/ReviewStatistics/ReviewStatistics';
import { getProductReviews } from '@/store/slices/reviewSlice';
import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ProductReview = ({ product }) => {
  const dispatch = useDispatch();
  const { productReviews } = useSelector((state) => state.review);
  console.log('first');
  useEffect(() => {
    if (product?._id) {
      dispatch(
        getProductReviews({
          productId: product._id,
          params: {
            page: 1,
            limit: 10
          }
        })
      );
    }
  }, [dispatch, product?._id]);

  return (
    <div className='mt-4 flex flex-col gap-2 rounded-sm bg-white p-4'>
      <Collapse title='ĐÁNH GIÁ SẢN PHẨM' className='bg-[#FAFAFA]' isShow={true}>
        <div className='rounded bg-white p-3 sm:p-4'>
          <ReviewStatistics reviews={productReviews} />

          <div className='mt-6'>
            <ReviewList productId={product._id} />
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default memo(ProductReview);
