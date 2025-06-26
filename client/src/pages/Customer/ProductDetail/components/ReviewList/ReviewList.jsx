import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductReviews, setPage, setLimit } from '@/store/slices/reviewSlice';
import { Avatar, Pagination, Empty, Spin } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Rate from '@/components/common/Rate/Rate';

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { productReviewsByStar, pagination, loading } = useSelector((state) => state.review);
  const [filter, setFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'

  useEffect(() => {
    if (productId) {
      dispatch(
        getProductReviews({
          productId,
          params: {
            page: pagination.page,
            limit: pagination.limit,
            rating: filter !== 'all' ? parseInt(filter) : undefined
          }
        })
      );
    }
  }, [dispatch, productId, pagination.page, pagination.limit, filter]);

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handleLimitChange = (current, size) => {
    dispatch(setLimit(size));
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    dispatch(setPage(1)); // Reset to first page when filter changes
  };

  const renderRatingFilters = () => {
    const filters = ['all', '5', '4', '3', '2', '1'];

    return (
      <div className='mb-8 flex flex-wrap gap-2'>
        {filters.map((value) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === value ? 'bg-[#333] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {value === 'all' ? 'Tất cả' : `${value} sao`}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className='mt-4'>
      {renderRatingFilters()}

      {loading ? (
        <div className='flex justify-center py-8'>
          <Spin size='large' />
        </div>
      ) : productReviewsByStar?.length === 0 ? (
        <Empty description='Chưa có đánh giá nào cho sản phẩm này' />
      ) : (
        <>
          <div>
            {productReviewsByStar.map((review) => (
              <div key={review._id} className='border-b pb-4'>
                <div className='flex items-start gap-3'>
                  <Avatar src={review.user?.avatar} className='flex-shrink-0'>
                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>

                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <h4 className='text-sm font-medium'>
                        {review.userId?.lastName + ' ' + review.userId?.firstName || 'Người dùng ẩn danh'}
                      </h4>
                      <span className='ml-2 text-xs text-gray-400'>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </span>
                    </div>

                    <div className='mt-1'>
                      <Rate disabled value={review.rating} size={16} />
                    </div>

                    <h5 className='mt-2 font-medium'>{review.title}</h5>
                    <p className='mt-1 whitespace-pre-line text-sm text-gray-700'>{review.content}</p>

                    {review.reply && (
                      <div className='mt-3 rounded-md bg-gray-50 p-3'>
                        <p className='text-xs font-medium text-gray-500'>Phản hồi từ Cửa hàng:</p>
                        <p className='mt-1 text-sm'>{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.total > pagination.limit && (
            <div className='mt-6 flex justify-center'>
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                onChange={handlePageChange}
                onShowSizeChange={handleLimitChange}
                showSizeChanger
                pageSizeOptions={['5', '10', '20']}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(ReviewList);
