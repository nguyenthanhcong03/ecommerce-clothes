import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import useDebounce from '@/hooks/useDebounce';
import { removeCartItem, updateCartItem } from '@/store/slices/cartSlice';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { generateNameId } from '@/utils/helpers/fn';
import { message } from 'antd';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SidebarCartItem({ item }) {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  const isAvailable = item?.isAvailable !== false; // Mặc định là true nếu không có giá trị
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debouncedQuantity = useDebounce(localQuantity, 500);
  console.log(loadingUpdate);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleItemClick = useCallback(() => {
    dispatch(toggleSidebar());
    navigate(`/product/${generateNameId({ name: item.name, id: item._id })}`);
  }, [item, navigate, dispatch]);

  // Sync local quantity với item quantity
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Effect để gọi API khi debouncedQuantity thay đổi
  useEffect(() => {
    if (debouncedQuantity !== item.quantity && isAvailable) {
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
    }
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
          value={localQuantity}
          min={1}
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

SidebarCartItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    isAvailable: PropTypes.bool,
    snapshot: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      size: PropTypes.string,
      color: PropTypes.string
    }).isRequired
  }).isRequired
};

export default SidebarCartItem;
