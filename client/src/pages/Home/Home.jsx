import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Banner from '../../components/Banner/Banner';
import Info from '../../components/Info/Info';
import HeadlineProduct from '../../components/HeadlineProduct/HeadlineProduct';
import CountDownBanner from '../../components/CountDownBanner/CountDownBanner';
import countdownBanner1 from '../../assets/images/countdownBanner1.jpeg';
import PopularProduct from '../../components/PopularProduct/PopularProduct';
import { getProducts } from '../../apis/productsService';
import Button from '../../components/Button/Button';
import SaleHomePage from '../../components/SaleHomePage/SaleHomePage';
function Home() {
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
    <MainLayout>
      <Banner />
      <div className='px-5'>
        <Info />
        <HeadlineProduct />
        {/* Popular Product */}
        {/* <div className='w-full'> */}
        <div className='container mx-auto grid max-w-[1280px] grid-cols-2 justify-items-center gap-5 lg:grid-cols-4'>
          <div className='col-span-2 h-full w-full'>
            <CountDownBanner backgroundImage={countdownBanner1} />
          </div>
          <PopularProduct data={listProducts.slice(0, 10)} />
          <div className='col-span-full my-10'>
            <Button text={'XEM TẤT CẢ'} isPrimary />
          </div>
        </div>
      </div>
      {/* </div> */}

      <SaleHomePage />
    </MainLayout>
  );
}

export default Home;
