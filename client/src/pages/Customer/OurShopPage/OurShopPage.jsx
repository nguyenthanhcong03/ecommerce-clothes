import countdownBanner2 from '@assets/images/countdownBanner2.jpeg';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import CountDownBanner from '@components/CountDownBanner/CountDownBanner';
import Dropdown from '@components/Dropdown/Dropdown';
import Button from '@components/Button/Button';
import ProductItem from '@components/ProductItem/ProductItem';
import { getAllProducts } from '@services/productService';
import { useEffect, useState } from 'react';

function OurShopPage() {
  const [products, setProducts] = useState([]);
  const [visibleItems, setVisibleItems] = useState(8);
  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + 8); // Hiển thị thêm 5 item
  };
  const fetchAllProducts = async () => {
    try {
      let res = await getAllProducts();
      console.log(res);
      setProducts(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllProducts();
  }, []);
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
        <Dropdown options={options} className={'w-[280px]'} />
      </div>
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
        {products?.slice(0, visibleItems).map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            src={product.images[0]}
            previewSrc={product.images[1]}
            name={product.title}
            price={product.price}
          />
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
