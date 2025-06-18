import Button from '@/components/common/Button';
import useProductVariants from '@/hooks/useProductVariants';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ product }) => {
  const navigate = useNavigate();
  const { variantOptions, getSelectedPrice } = useProductVariants(product);

  const { price, originalPrice, stock } = getSelectedPrice();
  return (
    <div
      key={product?._id}
      className='flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition hover:shadow-md md:flex-row'
    >
      <div className='relative h-60 md:h-auto md:w-1/3'>
        <img src={product?.images[0]} alt={product?.name} className='h-full w-full object-cover' />
      </div>
      <div className='flex flex-col justify-between p-4 md:w-2/3'>
        <div>
          <h3 className='mb-2 text-lg font-semibold'>{product?.name}</h3>
          <div className='mb-2 flex items-center'>
            <div className='flex text-yellow-400'>
              {Array.from({ length: 5 }).map((_, index) => (
                <StarFilled
                  key={index}
                  className={index < Math.round(product?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className='ml-2 text-sm text-gray-600'>
              ({product?.totalReviews || 0} đánh giá) | {product?.salesCount} (lượt bán)
            </span>
          </div>
          <p className='mb-4 line-clamp-2 text-sm text-gray-600'>{product?.description}</p>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            {originalPrice !== 0 && (
              <span className='mr-2 text-sm text-gray-400 line-through'>{formatCurrency(originalPrice)}</span>
            )}
            <span className='text-primary-600 text-lg font-bold'>{formatCurrency(price)}</span>
          </div>
          <Button variant='ghost' onClick={() => navigate(`/product/${product?._id}`)}>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
