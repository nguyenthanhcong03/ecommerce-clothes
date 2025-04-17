import CartTable from '@/components/cart/CartTable/CartTable';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import { ShoppingCart } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../../../redux/features/cart/cartSlice';

const CartSteps = () => (
  <div className='flex min-h-[50px] items-center justify-center gap-4 bg-[#FAFAFA] md:min-h-[70px] lg:min-h-[120px]'>
    {/* Steps content */}
  </div>
);

const EmptyCart = ({ onBackToShop }) => (
  <div className='py-28'>
    <div className='flex flex-col items-center justify-center gap-2 py-10'>
      <ShoppingCart fontSize={50} />
      <div className='text-2xl'>GIỎ HÀNG CỦA BẠN TRỐNG!</div>
      <div className='max-w-md text-center text-sm'>
        Chúng tôi mời bạn khám phá bộ sưu tập đa dạng tại cửa hàng của chúng tôi. Chắc chắn bạn sẽ tìm được món đồ phù
        hợp với phong cách của mình!
      </div>
    </div>
    <div className='flex w-full items-center justify-center'>
      <Button onClick={onBackToShop}>TRỞ VỀ CỬA HÀNG</Button>
    </div>
  </div>
);

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getCart());
    console.log('rểnder');
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='mt-[80px]'>
      <CartSteps />
      {items && items.length > 0 ? (
        // Add key prop to force re-render
        <CartTable key={items.length} />
      ) : (
        <EmptyCart onBackToShop={() => navigate('/shop')} />
      )}
    </div>
  );
}

export default CartPage;
