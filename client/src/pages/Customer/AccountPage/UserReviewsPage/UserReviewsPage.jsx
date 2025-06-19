import Rate from '@/components/common/Rate/Rate';
import { getUserReviews, setLimit, setPage } from '@/store/slices/reviewSlice';
import { Card, Empty, Pagination, Spin } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const UserReviewsPage = () => {
  const dispatch = useDispatch();
  const { userReviews, pagination, loading } = useSelector((state) => state.review);
  const { isAuthenticated } = useSelector((state) => state.account);
  console.log('userReviews:', userReviews);
  console.log('pagination:', pagination);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(
        getUserReviews({
          page: pagination.page,
          limit: pagination.limit
        })
      );
    }
  }, [dispatch, isAuthenticated, pagination.page, pagination.limit]);

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handleLimitChange = (current, size) => {
    dispatch(setLimit(size));
  };

  if (!isAuthenticated) {
    return (
      <div className='py-10 text-center'>
        <p className='mb-4'>Vui lòng đăng nhập để xem đánh giá của bạn</p>
        <Link to='/login' className='text-primary hover:underline'>
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='mb-6 text-2xl font-bold'>Đánh giá của tôi</h1>

      {loading ? (
        <div className='flex justify-center py-8'>
          <Spin size='large' />
        </div>
      ) : userReviews.length === 0 ? (
        <Empty description='Bạn chưa có đánh giá nào' />
      ) : (
        <>
          <div className='grid grid-cols-1 gap-6'>
            {userReviews.map((review) => (
              <Card key={review._id} className='shadow-sm'>
                <div className='flex flex-col gap-4 md:flex-row'>
                  <div className='w-full flex-shrink-0 md:w-24'>
                    <img
                      src={review.productId?.images[0]}
                      alt={review.productId?.name}
                      className='h-24 w-full rounded object-cover'
                    />
                  </div>

                  <div className='flex-1'>
                    <Link to={`/product/${review.productId?.slug}`} className='text-lg font-medium'>
                      {review.productId?.name}
                    </Link>

                    <div className='mt-2 flex items-center gap-2'>
                      <Rate disabled size={18} value={review.rating} className='text-sm text-amber-400' />
                      <span className='text-sm text-gray-500'>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true, // chữ "trước" (11 phút trước)
                          locale: vi
                        })}
                      </span>
                    </div>

                    <p className='mt-1 text-gray-700'>{review?.comment}</p>

                    {review.reply && (
                      <div className='mt-3 rounded-md bg-gray-50 p-3'>
                        <p className='text-xs font-medium text-gray-500'>Phản hồi từ Cửa hàng:</p>
                        <p className='mt-1 text-sm'>{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
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

export default UserReviewsPage;
