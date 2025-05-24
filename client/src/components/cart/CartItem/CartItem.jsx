import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { toast } from 'react-toastify';

function CartItem({ item }) {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  const dispatch = useDispatch();
  console.log('item', item.snapshot.name, item.quantity);

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      if (newQuantity !== item.quantity) {
        dispatch(updateCartItem({ itemId: item._id, quantity: newQuantity }))
          .unwrap()
          .then(() => toast.success('Cập nhật số lượng thành công'))
          .catch((err) => toast.error('Cập nhật số lượng thất bại: ' + err));
      }
    },
    [item, dispatch]
  );

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => toast.success('Xóa sản phẩm thành công'))
      .catch((err) => toast.error('Xóa sản phẩm thất bại: ' + err));
  };

  return (
    <div className='group relative flex items-center justify-between gap-5 overflow-hidden px-5 py-3 transition-colors duration-200 ease-in hover:bg-[#f7f7f7]'>
      <img src={item?.snapshot.image} alt='' className='h-auto w-[70px] cursor-pointer' />
      <div className='flex flex-1 flex-col items-start justify-center gap-1'>
        <div className='line-clamp-2 cursor-pointer text-xs text-primaryColor'>{item?.snapshot.name}</div>
        <div className='text-sm text-secondaryColor'>
          {item?.snapshot.color},{item?.snapshot.size}
        </div>
        <div className='text-sm text-secondaryColor'>{item?.snapshot.price} Đ</div>
      </div>
      <div className={`${isUpdating ? 'opacity-50' : ''}`}>
        {console.log('item.quantity', item.snapshot.name, item.quantity)}
        <QuantityInput
          className='h-5'
          inputClassName='text-xs w-6'
          buttonClassName='!w-5'
          value={item.quantity}
          min={1}
          max={item.snapshot.stock}
          onChange={(newQuantity) => handleQuantityChange(newQuantity)}
          disabled={isUpdating}
        />
      </div>
      <div>
        <X
          className='absolute right-2 top-2 translate-x-6 cursor-pointer text-sm text-secondaryColor opacity-0 transition-all duration-200 ease-in hover:text-primaryColor group-hover:-translate-x-0 group-hover:opacity-100'
          onClick={() => handleRemoveItem(item._id)}
        />
      </div>
    </div>
  );
}

export default CartItem;
