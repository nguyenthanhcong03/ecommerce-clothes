import useDebounce from '@/hooks/useDebounce';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useCartItem = (item) => {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);

  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  let debouncedQuantity = useDebounce(localQuantity, 500);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  const isAvailable = item?.isAvailable !== false; // Mặc định là true nếu không có giá trị
  const dispatch = useDispatch();

  // Effect để đồng bộ localQuantity với item.quantity khi item.quantity thay đổi từ store
  useEffect(() => {
    if (!hasUserInteracted && item.quantity !== localQuantity) {
      setLocalQuantity(item.quantity);
    }
  }, [item.quantity, hasUserInteracted, localQuantity]);

  // Effect để gọi API khi debouncedQuantity thay đổi
  useEffect(() => {
    if (hasUserInteracted && debouncedQuantity !== item.quantity && isAvailable) {
      dispatch(updateCartItem({ itemId: item._id, quantity: debouncedQuantity }))
        .unwrap()
        .then(() => {
          // message.success('Cập nhật số lượng thành công');
          setHasUserInteracted(false); // Reset flag sau khi cập nhật thành công
        })
        .catch((err) => {
          message.error('Cập nhật số lượng thất bại: ' + err.message);
          // Reset về giá trị ban đầu nếu thất bại
          setLocalQuantity(item.quantity);
          setHasUserInteracted(false);
        });
    }
  }, [debouncedQuantity, item.quantity, item._id, dispatch, isAvailable, hasUserInteracted]);

  const handleQuantityChange = useCallback(
    async (newQuantity) => {
      if (!isAvailable) {
        message.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      // Đánh dấu là user đã tương tác và cập nhật local state
      setHasUserInteracted(true);
      setLocalQuantity(newQuantity);
    },
    [isAvailable]
  );

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => message.success('Xóa sản phẩm thành công'))
      .catch((err) => message.error('Xóa sản phẩm thất bại: ' + err));
  };
  return {
    localQuantity,
    setLocalQuantity,
    debouncedQuantity,
    isUpdating,
    isAvailable,
    hasUserInteracted,
    handleQuantityChange,
    handleRemoveItem
  };
};

export default useCartItem;
