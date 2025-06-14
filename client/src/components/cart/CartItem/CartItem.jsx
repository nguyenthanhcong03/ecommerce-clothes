import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '@/store/slices/sidebarSlice';

function CartItem({ item }) {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);
  const isUpdating = loadingUpdate && itemUpdate?._id === item?.productId;
  const isAvailable = item?.isAvailable !== false; // Mặc định là true nếu không có giá trị
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleItemClick = useCallback(() => {
    dispatch(toggleSidebar());
    navigate(`/product/${item?.productId}`);
  }, [item, navigate, dispatch]);

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      if (!isAvailable) {
        toast.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      if (newQuantity !== item?.quantity) {
        dispatch(updateCartItem({ itemId: item?._id, quantity: newQuantity }))
          .unwrap()
          // .then(() => toast.success('Cập nhật số lượng thành công'))
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
    <div
      className={`group relative flex items-center justify-between gap-2 overflow-hidden p-4 transition-colors duration-200 ease-in hover:bg-[#f7f7f7] ${!isAvailable ? 'bg-gray-100 opacity-70' : ''}`}
    >
      {!isAvailable && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-10'>
          <div className='-rotate-15 transform rounded-md bg-red-500 px-2 py-1 text-sm font-medium text-white'>
            Sản phẩm không khả dụng
          </div>
        </div>
      )}
      <div className='flex items-center gap-3'>
        <img
          src={item?.snapshot.image}
          alt=''
          className={`h-auto w-[70px] cursor-pointer ${!isAvailable ? 'grayscale filter' : ''}`}
          onClick={isAvailable ? handleItemClick : undefined}
        />
        <div className='flex flex-1 flex-col items-start justify-center gap-1'>
          <div className={`line-clamp-2 cursor-pointer text-xs ${isAvailable ? 'text-primaryColor' : 'text-gray-500'}`}>
            {item?.snapshot.name}
            {!isAvailable && <span className='ml-1 text-red-500'>(Không khả dụng)</span>}
          </div>
          <div className='text-sm text-secondaryColor'>
            {item?.snapshot.color},{item?.snapshot.size}
          </div>
          <div className='text-sm text-secondaryColor'>{item?.snapshot.price} đ</div>
        </div>
      </div>
      <div className={`${isUpdating || !isAvailable ? 'opacity-50' : ''}`}>
        <QuantityInput
          className='h-5'
          inputClassName='text-xs w-6'
          buttonClassName='!w-5'
          value={item?.quantity || 1}
          min={1}
          max={item?.snapshot.stock || 999}
          onChange={(newQuantity) => handleQuantityChange(newQuantity)}
          disabled={!isAvailable || isUpdating}
        />
      </div>
      <div className='absolute right-2 top-2 z-40 translate-x-6 cursor-pointer text-sm text-secondaryColor opacity-0 transition-all duration-200 ease-in hover:scale-110 hover:text-primaryColor active:scale-95 group-hover:-translate-x-0 group-hover:opacity-100'>
        <X width={20} onClick={() => handleRemoveItem(item._id)} />
      </div>
    </div>
  );
}

export default CartItem;
