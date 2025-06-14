import countdownBanner1 from '@/assets/images/countdownBanner1.jpeg';
import Button from '@/components/common/Button/Button';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import Headline from '@/components/common/Headline/Headline';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import CategorySection from '@/pages/customer/HomePage/components/CategorySection';
import Info from '@/pages/customer/HomePage/components/Info';
import { fetchProducts, setPage } from '@/store/slices/productSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function HomePage() {
  const dispatch = useDispatch();
  const { products, pagination } = useSelector((state) => state.product);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    const nextPage = pagination.page + 1;

    const resultAction = await dispatch(fetchProducts({ page: nextPage, limit: 10 }));
    // Nếu kết quả trả về ít hơn limit, thì không còn sản phẩm
    if (resultAction.payload.products.length < 10) {
      setHasMore(false);
    }

    dispatch(setPage(nextPage));
  };

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);
  return (
    <div>
      <Info />
      <div className='my-8 flex flex-col gap-4 rounded-md bg-white p-8'>
        <Headline text1='khám phá ngay' text2='DANH MỤC SẢN PHẨM' />
        <CategorySection />
      </div>
      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1={'đừng bỏ lỡ ưu đãi siêu lớn'} text2={'SẢN PHẨM BÁN CHẠY'} />
      </div>
      <div className='container mx-auto grid max-w-[1280px] grid-cols-2 justify-items-center gap-5 lg:grid-cols-4'>
        <div className='col-span-2 h-full w-full'>
          <CountDownBanner bannerImage={countdownBanner1} />
        </div>
        {products.map((item) => (
          <ProductCard item={item} key={item._id} />
        ))}
        {hasMore && (
          <div className='col-span-full my-10'>
            <Button onClick={handleLoadMore}>Xem thêm</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
