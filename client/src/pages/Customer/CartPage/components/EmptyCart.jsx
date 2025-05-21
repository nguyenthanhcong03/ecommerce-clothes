import { ShoppingCart } from 'lucide-react';
import Button from '@/components/common/Button/Button';

const EmptyCart = ({ onBackToShop }) => (
  <div className='rounded-md bg-white py-28'>
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

export default EmptyCart;
