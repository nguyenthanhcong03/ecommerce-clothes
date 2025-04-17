import countdownBanner2 from '@/assets/images/countdownBanner2.jpeg';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Button from '@/components/common/Button/Button';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import Select from '@/components/common/Select/Select';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import { getAllProducts } from '@/services/productService';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/features/product/productSlice';

function OurShopPage() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const [visibleItems, setVisibleItems] = useState(8);
  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + 8); // Hiển thị thêm 8 item
  };

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 2 }));
  }, [dispatch]);
  const breadcrumbItems = [{ label: 'Trang chủ', link: '/' }, { label: 'Sản phẩm' }];
  const options = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Sản phẩm bán chạy nhất', value: '1' },
    { label: 'Sản phẩm mới nhất', value: '2' },
    { label: 'Giá từ thấp đến cao', value: '3' },
    { label: 'Giá từ cao đến thấp', value: '4' }
  ];
  return (
    <div className='mx-auto w-full max-w-[1280px] pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className='h-[280px] w-full'>
        <CountDownBanner backgroundImage={countdownBanner2} />
      </div>
      <div className='my-5'>
        <Select options={options} className={'w-[280px]'} />
      </div>
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
        {products?.slice(0, visibleItems).map((product) => (
          <ProductCard key={product._id} item={product} />
        ))}
      </div>
      {visibleItems < products?.length && (
        <div className='my-10 flex justify-center' onClick={handleLoadMore}>
          <Button>Xem thêm</Button>
        </div>
      )}
    </div>
  );
}

export default OurShopPage;
