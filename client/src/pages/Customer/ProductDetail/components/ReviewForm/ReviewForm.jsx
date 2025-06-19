import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createReview, resetSuccess, resetError } from '@/store/slices/reviewSlice';
import { message, Rate } from 'antd';
import Button from '@/components/common/Button/Button';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { submitting, success, error } = useSelector((state) => state.review);
  const { isAuthenticated } = useSelector((state) => state.account);

  const [rating, setRating] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      content: '',
      title: ''
    }
  });

  const onSubmit = (data) => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    const reviewData = {
      productId,
      rating,
      ...data
    };

    dispatch(createReview(reviewData))
      .unwrap()
      .then(() => {
        message.success('Đánh giá của bạn đã được gửi thành công!');
        reset();
        setRating(5);
        if (onReviewSubmitted) onReviewSubmitted();
      })
      .catch((error) => {
        message.error(error?.message || 'Có lỗi xảy ra khi gửi đánh giá');
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='rounded-md bg-white p-4 shadow-sm'>
      <h3 className='mb-4 text-lg font-medium'>Viết đánh giá của bạn</h3>

      <div className='mb-4'>
        <label className='mb-1 block text-sm font-medium text-gray-700'>Đánh giá</label>
        <Rate value={rating} onChange={setRating} className='text-amber-400' />
      </div>

      <div className='mb-4'>
        <label htmlFor='title' className='mb-1 block text-sm font-medium text-gray-700'>
          Tiêu đề
        </label>
        <input
          id='title'
          type='text'
          className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
          placeholder='Nhập tiêu đề ngắn gọn'
          {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
        />
        {errors.title && <p className='mt-1 text-xs text-red-500'>{errors.title.message}</p>}
      </div>

      <div className='mb-4'>
        <label htmlFor='content' className='mb-1 block text-sm font-medium text-gray-700'>
          Nội dung đánh giá
        </label>
        <textarea
          id='content'
          rows={4}
          className={`w-full border ${errors.content ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
          placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này'
          {...register('content', { required: 'Vui lòng nhập nội dung đánh giá' })}
        />
        {errors.content && <p className='mt-1 text-xs text-red-500'>{errors.content.message}</p>}
      </div>

      <Button type='submit' variant='primary' className='w-full sm:w-auto' disabled={submitting}>
        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </Button>
    </form>
  );
};

export default ReviewForm;
