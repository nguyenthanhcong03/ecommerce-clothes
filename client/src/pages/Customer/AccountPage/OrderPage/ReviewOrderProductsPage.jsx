import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Rate from '@/components/common/Rate/Rate';
import Textarea from '@/components/common/Textarea/Textarea';
import { createReview, getReviewableProducts, resetSuccess } from '@/store/slices/reviewSlice';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Card, Empty, message, Spin } from 'antd';
import { ChevronLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const ReviewOrderProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { reviewableProducts, loading, submitting, success } = useSelector((state) => state.review);
  const [activeProduct, setActiveProduct] = useState(null);
  const [rating, setRating] = useState(5);
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue
  } = useForm({
    defaultValues: {
      rating: 5,
      comment: ''
    }
  });

  useEffect(() => {
    if (orderId) {
      dispatch(getReviewableProducts(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (success) {
      reset();
      setActiveProduct(null);
      setRating(5);
      message.success('Đánh giá thành công!');
      dispatch(resetSuccess());
      // Refresh
      dispatch(getReviewableProducts(orderId));
    }
  }, [success, dispatch, orderId, reset]);

  const onSubmit = (data) => {
    if (!activeProduct) return;

    if (data.rating < 1 || data.rating > 5) {
      setError('rating', {
        type: 'manual',
        message: 'Vui lòng chọn đánh giá từ 1 đến 5 sao'
      });
      return;
    }

    const reviewData = {
      productId: activeProduct.productId,
      orderId,
      ...data
    };
    console.log('react reviewData', reviewData);
    dispatch(createReview(reviewData));
  };

  const handleSelectProduct = (product) => {
    setActiveProduct(product);
    reset({
      rating: 5,
      comment: ''
    });
  };

  const handleRatingChange = (value) => {
    setValue('rating', value);
    setRating(value);
    if (errors.rating) {
      clearErrors('rating');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <Spin size='large' />
      </div>
    );
  }

  if (reviewableProducts.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <Empty
            description='Không có sản phẩm nào có thể đánh giá hoặc tất cả các sản phẩm đã được đánh giá'
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button className='mt-4' onClick={() => navigate('/user/order')}>
            Quay lại đơn hàng
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex flex-wrap items-center justify-between'>
        <h1 className='text-2xl font-bold'>Đánh giá sản phẩm từ đơn hàng</h1>
        <Button
          className='flex items-center'
          variant='ghost'
          leftIcon={<ChevronLeftIcon className='h-4 w-4' />}
          onClick={() => navigate('/user/order')}
        >
          Quay lại đơn hàng
        </Button>
      </div>

      <div className='flex flex-col gap-6 lg:flex-row'>
        <div className='w-full lg:w-1/3'>
          <h3 className='mb-4 text-lg font-medium'>Chọn sản phẩm để đánh giá</h3>
          <div className='space-y-4'>
            {reviewableProducts.map((product) => (
              <Card
                key={product.productId}
                className={`cursor-pointer transition ${
                  activeProduct?.productId === product.productId ? 'border-[#333] shadow-md' : 'hover:border-gray-300'
                }`}
                onClick={() => handleSelectProduct(product)}
              >
                <div className='flex items-center gap-3'>
                  <img
                    src={product?.productInfo?.image}
                    alt={product?.productInfo?.name}
                    className='h-16 w-16 rounded object-cover'
                  />
                  <div>
                    <h4 className='font-medium'>{product?.productInfo?.name}</h4>
                    <p className='text-xs text-gray-500'>
                      {product?.productInfo?.color} | {product?.productInfo?.size}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className='w-full lg:w-2/3'>
          {activeProduct ? (
            <div className='rounded-lg bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-medium'>Đánh giá sản phẩm</h3>

              <div className='mb-6 flex items-center gap-3'>
                <img
                  src={activeProduct?.productInfo?.image}
                  alt={activeProduct?.productInfo?.name}
                  className='h-20 w-20 rounded object-cover'
                />
                <div>
                  <h4 className='font-medium'>{activeProduct?.productInfo?.name}</h4>
                  <p className='text-sm text-gray-500'>
                    {activeProduct?.productInfo?.color} | {activeProduct?.productInfo?.size}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='form-group'>
                  <label className='mb-1 block font-medium'>Đánh giá của bạn</label>
                  <Rate value={rating} onChange={handleRatingChange} />
                  {errors.rating && <p className='mt-1 text-sm text-red-500'>{errors.rating.message}</p>}
                </div>
                <div className='form-group'>
                  <label className='mb-1 block font-medium'>Nội dung đánh giá</label>
                  <textarea
                    className='w-full flex-1 resize-none border border-gray-300 p-3 px-[10px] text-sm outline-none focus-within:border-primaryColor'
                    rows={4}
                    placeholder='Chia sẻ cảm nhận của bạn về sản phẩm'
                    {...register('comment', { required: 'Vui lòng nhập nội dung đánh giá' })}
                  />
                  {errors.comment && <p className='mt-1 text-sm text-red-500'>{errors.comment.message}</p>}
                </div>{' '}
                <div className='form-group'>
                  <Button type='submit' loading={submitting}>
                    Gửi đánh giá
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className='rounded-lg bg-white p-8 text-center shadow-sm'>
              <CheckCircleOutlined className='mb-4 text-4xl text-gray-400' />
              <h3 className='mb-2 text-lg font-medium'>Chọn một sản phẩm để bắt đầu đánh giá</h3>
              <p className='mb-4 text-gray-500'>Hãy chọn một sản phẩm từ danh sách bên trái để viết đánh giá của bạn</p>
              <Button variant='secondary' onClick={() => navigate('/user/order')}>
                Quay lại đơn hàng
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderProductsPage;
