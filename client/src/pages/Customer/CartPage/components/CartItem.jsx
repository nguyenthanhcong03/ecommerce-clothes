import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import useDebounce from '@/hooks/useDebounce';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { message } from 'antd';
import { Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CartPageItem = ({ item, onSelect, isSelected }) => {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);

  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debouncedQuantity = useDebounce(localQuantity, 500);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  const isAvailable = item?.isAvailable !== false; // Mặc định là true nếu không có giá trị
  const dispatch = useDispatch();

  // Sync local quantity với item quantity
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Effect để gọi API khi debouncedQuantity thay đổi
  useEffect(() => {
    // if (debouncedQuantity !== item.quantity && isAvailable) {
    dispatch(updateCartItem({ itemId: item._id, quantity: debouncedQuantity }))
      .unwrap()
      .then(() => {
        // message.success('Cập nhật số lượng thành công');
      })
      .catch((err) => {
        message.error('Cập nhật số lượng thất bại: ' + err.message);
        // Reset về giá trị ban đầu nếu thất bại
        setLocalQuantity(item.quantity);
      });
    // }
  }, [debouncedQuantity, item.quantity, item._id, dispatch, isAvailable]);

  const handleQuantityChange = useCallback(
    async (newQuantity) => {
      if (!isAvailable) {
        message.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      // Chỉ cập nhật local state, không gọi API ngay lập tức
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
  return (
    <div className={`flex flex-col gap-4 border-b px-2 py-4 ${!isAvailable ? 'bg-gray-50' : ''}`}>
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
          <div className='flex gap-3'>
            <img
              src={item.snapshot.image}
              alt={item.snapshot.name}
              className={`h-24 w-20 object-cover ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
            />
            <div className='flex flex-col justify-between'>
              {/* Badge khi sản phẩm không khả dụng */}
              {!isAvailable && (
                <div className='flex w-fit items-center gap-1 rounded bg-red-50 text-xs font-medium text-red-600'>
                  <span className='inline-block h-2 w-2 rounded-full bg-red-500'></span>
                  Sản phẩm không khả dụng
                </div>
              )}
              <div className={`line-clamp-2 text-sm ${!isAvailable ? 'text-gray-500' : ''}`}>{item.snapshot.name}</div>
              <div className='text-sm text-gray-600'>
                {item.snapshot.size}, {item.snapshot.color}
              </div>
              <div className='text-sm text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
            </div>
          </div>
          <div className='flex h-[96px] flex-col justify-between'>
            <div className='flex items-center justify-end gap-2 hover:opacity-80'>
              <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => handleRemoveItem(item._id)} />
            </div>

            <div className={`${isUpdating || !isAvailable ? 'opacity-50' : ''} relative`}>
              <QuantityInput
                value={localQuantity}
                min={1}
                // max={item.snapshot.stock}
                onChange={handleQuantityChange}
                disabled={!isAvailable || isUpdating}
              />
            </div>
          </div>
        </div>
      </div>
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
            {/* Badge khi sản phẩm không khả dụng */}
            {!isAvailable && (
              <div className='flex w-fit items-center gap-1 rounded bg-red-50 text-xs font-medium text-red-600'>
                <span className='inline-block h-2 w-2 rounded-full bg-red-500'></span>
                Sản phẩm không khả dụng
              </div>
            )}
            {item.snapshot.name}
          </div>
        </div>
        <div className='col-span-1 text-center text-sm text-gray-600'>
          {item.snapshot.size}, {item.snapshot.color}
        </div>
        <div className='col-span-2 text-right text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
        <div
          className={`relative col-span-2 flex items-center justify-center ${isUpdating || !isAvailable ? 'opacity-50' : ''}`}
        >
          <QuantityInput
            value={localQuantity}
            min={1}
            onChange={handleQuantityChange}
            disabled={!isAvailable || isUpdating}
          />
        </div>
        <div className={`col-span-2 text-right text-sm font-medium ${isUpdating ? 'opacity-50' : ''}`}>
          {formatCurrency(item.snapshot.price * localQuantity)}
        </div>
        <div className='flex items-center justify-end gap-2 hover:opacity-80'>
          <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => handleRemoveItem(item._id)} />
        </div>
      </div>
    </div>
  );
};

CartPageItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    isAvailable: PropTypes.bool,
    snapshot: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      size: PropTypes.string,
      color: PropTypes.string,
      stock: PropTypes.number
    }).isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
};

export default CartPageItem;
