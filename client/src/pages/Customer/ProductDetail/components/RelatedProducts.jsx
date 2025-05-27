import ProductCard from '@/components/product/ProductCard/ProductCard';
import { fetchProducts } from '@/store/slices/productSlice';
import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const RelatedProducts = memo(({ productId }) => {
  const { products, loading } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);
  return (
    <div className='mx-auto my-8'>
      <h2 className='my-8 text-center text-xl sm:my-4 sm:text-2xl'>CÓ THỂ BẠN SẼ THÍCH</h2>
      {loading ? (
        <div className='flex h-64 items-center justify-center'>
          <span className='text-gray-500'>Đang tải...</span>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {products
            .filter((product) => product._id !== productId)
            .slice(0, 5)
            .map((product) => (
              <ProductCard key={product._id} item={product} isShowButton={false} />
            ))}
        </div>
      )}
    </div>
  );
});

RelatedProducts.displayName = 'RelatedProducts';

export default RelatedProducts;
