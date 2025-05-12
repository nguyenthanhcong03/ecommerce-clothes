import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderDetail, reviewOrder } from '@/store/slices/userOrderSlice';
import { ArrowLeft, Star, Loader2, Package, AlertCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className='flex'>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type='button'
          onClick={() => !readOnly && setRating(value)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
        >
          <Star className={`h-8 w-8 ${value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
};

const OrderReviewPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetail, loading } = useSelector((state) => state.userOrder);

  const [overallRating, setOverallRating] = useState(5);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId]);

  // Khởi tạo mảng đánh giá sản phẩm khi có dữ liệu đơn hàng
  useEffect(() => {
    if (orderDetail && orderDetail.items) {
      setProductReviews(
        orderDetail.items.map((item) => ({
          productId: item.product._id,
          productName: item.product.name,
          productImage: item.product.images[0],
          variant: item.variant || '',
          rating: 5,
          comment: ''
        }))
      );
    }
  }, [orderDetail]);

  // Xử lý thay đổi đánh giá sản phẩm
  const handleProductRatingChange = (index, rating) => {
    setProductReviews((prev) => prev.map((review, i) => (i === index ? { ...review, rating } : review)));
  };

  // Xử lý thay đổi nội dung đánh giá sản phẩm
  const handleProductCommentChange = (index, comment) => {
    setProductReviews((prev) => prev.map((review, i) => (i === index ? { ...review, comment } : review)));
  };

  // Gửi đánh giá
  const handleSubmitReview = (e) => {
    e.preventDefault();

    const reviewData = {
      orderRating: overallRating,
      comment: reviewText,
      productReviews: productReviews.map((review) => ({
        productId: review.productId,
        rating: review.rating,
        comment: review.comment
      }))
    };

    dispatch(reviewOrder({ orderId, reviewData }))
      .unwrap()
      .then(() => {
        navigate(`/account/order/detail/${orderId}`);
      })
      .catch((error) => {
        toast.error('Có lỗi xảy ra khi đánh giá. Vui lòng thử lại!');
      });
  };

  if (loading || !orderDetail) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
      </div>
    );
  }

  // Kiểm tra xem đơn hàng đã được đánh giá hay chưa
  if (orderDetail.isReviewed) {
    return (
      <div className='container mx-auto p-4'>
        <div className='flex items-center justify-center rounded-lg bg-yellow-50 p-6'>
          <AlertCircle className='mr-2 h-6 w-6 text-yellow-500' />
          <p className='text-yellow-700'>Đơn hàng này đã được đánh giá.</p>
        </div>
        <button
          onClick={() => navigate(`/account/order/detail/${orderId}`)}
          className='mt-4 flex items-center text-orange-500 hover:text-orange-600'
        >
          <ArrowLeft className='mr-1 h-5 w-5' />
          Quay lại chi tiết đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center'>
        <button
          onClick={() => navigate(`/account/order/detail/${orderId}`)}
          className='mr-4 flex items-center text-gray-600 hover:text-orange-500'
        >
          <ArrowLeft className='mr-1 h-5 w-5' />
          Quay lại
        </button>
        <h1 className='text-2xl font-medium'>Đánh giá đơn hàng</h1>
      </div>

      <form onSubmit={handleSubmitReview} className='space-y-8'>
        {/* Đánh giá tổng thể */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-medium'>Đánh giá tổng thể</h2>

          <div className='flex flex-col items-center justify-center'>
            <p className='mb-2 text-gray-600'>Bạn cảm thấy thế nào về trải nghiệm mua sắm này?</p>
            <StarRating rating={overallRating} setRating={setOverallRating} />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className='mt-4 h-24 w-full rounded-md border p-3'
              placeholder='Chia sẻ trải nghiệm của bạn (không bắt buộc)...'
            ></textarea>
          </div>
        </div>

        {/* Đánh giá sản phẩm */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-medium'>Đánh giá sản phẩm</h2>

          <div className='space-y-6'>
            {productReviews.map((review, index) => (
              <div key={index} className='border-b border-gray-200 pb-6 pt-4 first:pt-0 last:border-b-0 last:pb-0'>
                <div className='flex items-start'>
                  <div className='h-20 w-20 flex-shrink-0'>
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className='h-full w-full rounded-md object-cover'
                    />
                  </div>
                  <div className='ml-4'>
                    <h3 className='font-medium'>{review.productName}</h3>
                    {review.variant && <p className='text-sm text-gray-500'>Phân loại: {review.variant}</p>}

                    <div className='mt-3'>
                      <p className='mb-1 text-sm text-gray-600'>Đánh giá sản phẩm:</p>
                      <StarRating
                        rating={review.rating}
                        setRating={(rating) => handleProductRatingChange(index, rating)}
                      />
                    </div>

                    <div className='mt-3'>
                      <textarea
                        value={review.comment}
                        onChange={(e) => handleProductCommentChange(index, e.target.value)}
                        className='h-20 w-full rounded-md border p-2 text-sm'
                        placeholder='Nhập đánh giá về sản phẩm (không bắt buộc)...'
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút gửi đánh giá */}
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() => navigate(`/account/order/detail/${orderId}`)}
            className='mr-3 rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50'
          >
            Hủy
          </button>
          <button
            type='submit'
            className='inline-flex items-center rounded-md bg-orange-500 px-6 py-2 text-white hover:bg-orange-600'
            disabled={loading}
          >
            {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
            Gửi đánh giá
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderReviewPage;
