import React, { memo } from 'react';
import { Progress, Rate } from 'antd';
import { useSelector } from 'react-redux';
import { Star } from 'lucide-react';

const ReviewStatistics = ({ reviews = [] }) => {
  const { currentProduct, loadingFetchProductById, error } = useSelector((state) => state.product);

  // Thống kê đánh giá
  const calculateStats = () => {
    const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 sao
    if (!reviews.length) return counts;

    reviews.forEach((review) => {
      const rating = review.rating; // Làm tròn xuống để lấy giá trị nguyên
      if (rating >= 1 && rating <= 5) {
        counts[5 - rating]++; // Đếm số lượng đánh giá cho mỗi sao theo index
      }
    });

    return counts;
  };

  const statistics = calculateStats();

  // Tính phần trăm cho mỗi sao
  const percentages = statistics.map((count) =>
    currentProduct?.totalReviews ? Math.round((count / currentProduct?.totalReviews) * 100) : 0
  );

  return (
    <div className='flex flex-col gap-6 rounded-lg bg-white p-4 shadow-sm md:flex-row'>
      <div className='flex flex-shrink-0 flex-col items-center justify-center'>
        <span className='text-3xl font-bold text-gray-800'>{currentProduct?.averageRating}</span>
        <Rate disabled allowHalf value={currentProduct?.averageRating} className='my-2 text-sm text-amber-400' />
        <span className='text-sm text-gray-500'>{currentProduct?.totalReviews} đánh giá</span>
      </div>

      <div className='flex-1'>
        {[5, 4, 3, 2, 1].map((star, index) => (
          <div key={star} className='mb-1 flex items-center'>
            <div className='flex w-16 items-center'>
              <span className='mr-1 text-xs'>{star}</span>
              <Star fill='#FBBF24' strokeWidth={0} size={16} />
            </div>
            <Progress
              percent={percentages[index]}
              size='small'
              strokeColor='#FBBF24'
              className='flex-1'
              format={(percent) => `${percent}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ReviewStatistics);
