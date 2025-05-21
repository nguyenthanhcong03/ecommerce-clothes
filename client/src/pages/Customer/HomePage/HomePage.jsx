import countdownBanner1 from '@/assets/images/countdownBanner1.jpeg';
import Button from '@/components/common/Button/Button';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import PopularProduct from '@/components/product/PopularProduct/PopularProduct';
import Banner from '@/pages/customer/HomePage/components/Banner/Banner';
import Info from '@/pages/customer/HomePage/components/Info/Info';
import Categories from '@/pages/customer/HomePage/components/Categories/Categories';
import SaleHomePage from '@/pages/customer/HomePage/components/SaleHomePage/SaleHomePage';
import { fetchProducts } from '@/store/slices/productSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Headline from '@/components/common/Headline/Headline';

function HomePage() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);
  return (
    <div>
      <Banner />
      <div className='px-5'>
        <Info />
        <Categories />
        <div className='my-12'>
          <Headline text1={'đừng bỏ lỡ ưu đãi siêu lớn'} text2={'SẢN PHẨM BÁN CHẠY'} />
        </div>
        <div className='container mx-auto grid max-w-[1280px] grid-cols-2 justify-items-center gap-5 lg:grid-cols-4'>
          <div className='col-span-2 h-full w-full'>
            <CountDownBanner backgroundImage={countdownBanner1} />
          </div>
          <PopularProduct data={products.slice(0, 10)} />
          <div className='col-span-full my-10'>
            <Button>Xem thêm</Button>
          </div>
        </div>
      </div>

      <SaleHomePage />
    </div>
  );
}

export default HomePage;
