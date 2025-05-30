import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const CartItem = ({ item, onSelect, isSelected }) => {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  const isAvailable = item.isAvailable !== false; // Mặc định là true nếu không có giá trị
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      if (!isAvailable) {
        toast.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      if (newQuantity !== item.quantity) {
        dispatch(updateCartItem({ itemId: item._id, quantity: newQuantity }))
          .unwrap()
          .then(() => toast.success('Cập nhật số lượng thành công'))
          .catch((err) => toast.error('Cập nhật số lượng thất bại: ' + err));
      }
    },
    [item, dispatch, isAvailable]
  );

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => toast.success('Xóa sản phẩm thành công'))
      .catch((err) => toast.error('Xóa sản phẩm thất bại: ' + err));
  };
  return (
    <div className={`flex flex-col gap-4 border-b px-2 py-4 ${!isAvailable ? 'bg-gray-50' : ''}`}>
      {/* Badge khi sản phẩm không khả dụng */}
      {!isAvailable && (
        <div className='flex w-fit items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600'>
          <span className='inline-block h-2 w-2 rounded-full bg-red-500'></span>
          Sản phẩm không khả dụng
        </div>
      )}
      {/* Mobile view - cart item */}
      <div className='flex items-center justify-start gap-2 md:hidden'>
        {isSelected && (
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => onSelect(item._id)}
              className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
              disabled={!isAvailable}
            />
          </div>
        )}
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <img
              src={item.snapshot.image}
              alt={item.snapshot.name}
              className={`h-24 w-20 object-cover ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
            />
            <div className='flex flex-1 flex-col justify-start gap-3'>
              <div className={`text-sm ${!isAvailable ? 'text-gray-500' : ''}`}>{item.snapshot.name}</div>
              <div className='text-sm text-gray-600'>
                {item.snapshot.size}, {item.snapshot.color}
              </div>
              <div className='text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
            </div>
          </div>
          <div className='flex h-[96px] flex-col justify-between'>
            <div className='flex items-center justify-end gap-2 hover:opacity-80'>
              <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => handleRemoveItem(item._id)} />
            </div>

            <div className={`${isUpdating || !isAvailable ? 'opacity-50' : ''}`}>
              <QuantityInput
                value={item.quantity}
                min={1}
                max={item.snapshot.stock}
                onChange={(newQuantity) => handleQuantityChange(newQuantity)}
                disabled={!isAvailable || isUpdating}
              />
            </div>
          </div>
        </div>
      </div>{' '}
      {/* Desktop view - cart item */}
      <div className='hidden items-center justify-center gap-2 md:grid md:grid-cols-12'>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={() => onSelect(item._id)}
          className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
          disabled={!isAvailable}
        />
        <div className='col-span-3 flex items-center justify-start gap-4'>
          <img
            src={item.snapshot.image}
            alt={item.snapshot.name}
            className={`h-24 w-20 object-cover md:h-20 md:w-16 ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
          />
          <div className={`text-sm ${!isAvailable ? 'text-gray-500' : ''}`}>
            {item.snapshot.name}
            {!isAvailable && <span className='ml-1 text-xs text-red-500'>(Không khả dụng)</span>}
          </div>
        </div>
        <div className='col-span-1 text-center text-sm text-gray-600'>
          {item.snapshot.size}, {item.snapshot.color}
        </div>
        <div className='col-span-2 text-right text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
        <div
          className={`col-span-2 flex items-center justify-center ${isUpdating || !isAvailable ? 'opacity-50' : ''}`}
        >
          <QuantityInput
            value={item.quantity}
            min={1}
            max={item.snapshot.stock}
            onChange={(newQuantity) => handleQuantityChange(newQuantity)}
            disabled={!isAvailable || isUpdating}
          />
        </div>
        <div className={`col-span-2 text-right text-sm font-medium ${isUpdating ? 'opacity-50' : ''}`}>
          {formatCurrency(item.snapshot.price * item.quantity)}
        </div>
        <div className='flex items-center justify-end gap-2 hover:opacity-80'>
          <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => handleRemoveItem(item._id)} />
        </div>
      </div>
    </div>
  );
};

export default CartItem;
