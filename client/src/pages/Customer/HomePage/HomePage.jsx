import { getProducts } from '@services/productService';
import countdownBanner1 from '@assets/images/countdownBanner1.jpeg';
import SaleHomePage from '@pages/Customer/HomePage/components/SaleHomePage/SaleHomePage';
import Banner from '@pages/Customer/HomePage/components/Banner/Banner';
import Button from '@components/Button/Button';
import CountDownBanner from '@components/CountDownBanner/CountDownBanner';
import Headline from '@components/Headline/Headline';
import Info from '@pages/Customer/HomePage/components/Info/Info';
import PopularProduct from '@pages/Customer/HomePage/components/PopularProduct/PopularProduct';
import { useEffect, useState } from 'react';

function HomePage() {
  const [listProducts, setListProducts] = useState([]);
  useEffect(() => {
    const query = {
      sortType: '0',
      page: 1,
      limit: '10'
    };

    getProducts(query).then((res) => {
      setListProducts(res.contents);
    });
  }, []);
  return (
    <div>
      <Banner />
      <div className='px-5'>
        <Info />
        <div className='my-12'>
          <Headline text1={'đừng bỏ lỡ ưu đãi siêu lớn'} text2={'SẢN PHẨM BÁN CHẠY'} />
        </div>
        {/* Popular Product */}
        {/* <div className='w-full'> */}
        <div className='container mx-auto grid max-w-[1280px] grid-cols-2 justify-items-center gap-5 lg:grid-cols-4'>
          <div className='col-span-2 h-full w-full'>
            <CountDownBanner backgroundImage={countdownBanner1} />
          </div>
          <PopularProduct data={listProducts.slice(0, 10)} />
          <div className='col-span-full my-10'>
            <Button>Xem thêm</Button>
          </div>
        </div>
      </div>
      {/* </div> */}

      <SaleHomePage />
    </div>
  );
}

export default HomePage;
