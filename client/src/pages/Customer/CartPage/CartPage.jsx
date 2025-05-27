import { getCart } from '@/store/slices/cartSlice';
import { Skeleton } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartTable from './components/CartTable';
import EmptyCart from './components/EmptyCart';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Headline from '@/components/common/Headline/Headline';

// Cart skeleton loading component
const CartSkeleton = () => (
  <div className='mx-auto mt-10 max-w-[1280px] lg:p-8'>
    <div className='flex flex-col gap-8'>
      <div className='border px-4'>
        <div className='grid-cols-12 items-center gap-2 border-b py-4 md:grid'>
          <Skeleton.Input active style={{ width: '100%', height: 24 }} />
        </div>

        {/* Cart items skeletons */}
        {[1, 2, 3].map((item) => (
          <div key={item} className='border-b py-4'>
            <div className='flex items-center gap-4'>
              <Skeleton.Button active style={{ width: 20, height: 20 }} />
              <Skeleton.Image active style={{ width: 80, height: 80 }} />
              <div className='flex flex-1 flex-col gap-2'>
                <Skeleton.Input active style={{ width: '100%' }} />
                <Skeleton.Input active style={{ width: '60%' }} />
              </div>
              <Skeleton.Input active style={{ width: 80 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cart summary skeleton */}
      <div className='col-span-4 h-fit border bg-white p-6'>
        <div className='flex items-center gap-3'>
          <Skeleton.Button active style={{ width: 170, height: 20 }} />
          <Skeleton.Button active style={{ height: 20 }} />
        </div>

        <div className='my-4 flex justify-between text-lg font-semibold'>
          <Skeleton.Input active style={{ width: 250 }} />
          <Skeleton.Input active style={{ width: 100 }} />
        </div>

        <div className='space-y-3'>
          <Skeleton.Button active block style={{ height: 40 }} />
          <Skeleton.Button active block style={{ height: 40 }} />
        </div>
      </div>
    </div>
  </div>
);

function CartPage() {
  console.log('vao cart');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  return (
    <div className='px-5 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb
          items={[
            {
              label: 'Giỏ hàng',
              path: '/cart'
            }
          ]}
        />
      </div>
      <div className='my-8 rounded-sm bg-white p-8'>
        <Headline text1={'đừng bỏ lỡ ưu đãi, hãy tiến hành thanh toán'} text2={'GIỎ HÀNG'} />
      </div>
      {loading ? (
        <CartSkeleton />
      ) : items && items.length > 0 ? (
        <CartTable key={items.length} />
      ) : (
        <EmptyCart onBackToShop={() => navigate('/shop')} />
      )}
    </div>
  );
}

export default CartPage;
