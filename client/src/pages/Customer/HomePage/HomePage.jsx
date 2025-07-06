import Button from '@/components/common/Button/Button';
import Headline from '@/components/common/Headline/Headline';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import CategorySection from '@/pages/customer/HomePage/components/CategorySection';
import Info from '@/pages/customer/HomePage/components/Info';
import { fetchFeaturedProducts } from '@/store/slices/productSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function HomePage() {
  const dispatch = useDispatch();
  const { featuredProducts, loadingFeatured, error } = useSelector((state) => state.product);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
  const productsPerPage = 8;

  useEffect(() => {
    dispatch(fetchFeaturedProducts({ limit: productsPerPage, page: 1 }));
  }, [dispatch]);

  const handleLoadMoreFeatured = async () => {
    if (!loadingFeatured && hasMoreFeatured) {
      const nextPage = currentPage + 1;
      const result = await dispatch(fetchFeaturedProducts({ limit: productsPerPage, page: nextPage })).unwrap();
      console.log('reset result:', result);

      if (result && result.data && result.data.length < productsPerPage) {
        setHasMoreFeatured(false);
      }

      setCurrentPage(nextPage);
    }
  };

  useEffect(() => {
    document.title = 'Trang chủ | Outfitory';
  }, []);

  return (
    <div>
      <Info />
      <div className='my-8 flex flex-col gap-4 rounded-md bg-white p-8'>
        <Headline text1='khám phá ngay' text2='DANH MỤC SẢN PHẨM' />
        <CategorySection />
      </div>

      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1='sản phẩm nổi bật' text2='ĐƯỢC YÊU THÍCH NHẤT' />
        {loadingFeatured && featuredProducts.length === 0 ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-primaryColor border-t-transparent'></div>
          </div>
        ) : error ? (
          <div className='flex h-32 items-center justify-center text-red-500'>
            <p>Có lỗi xảy ra khi tải sản phẩm nổi bật: {error}</p>
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <>
            <div className='container mx-auto mt-8 grid max-w-[1280px] grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {featuredProducts.map((item) => (
                <ProductCard item={item} key={item._id} />
              ))}
            </div>
            {hasMoreFeatured && (
              <div className='mt-8 flex justify-center'>
                <Button
                  onClick={handleLoadMoreFeatured}
                  disabled={loadingFeatured}
                  isLoading={loadingFeatured}
                  variant='secondary'
                >
                  {loadingFeatured ? 'Đang tải...' : 'Xem thêm sản phẩm nổi bật'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='flex h-32 items-center justify-center text-gray-500'>
            <p>Hiện chưa có sản phẩm nổi bật nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
