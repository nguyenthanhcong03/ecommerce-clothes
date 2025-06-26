import { removeMultipleCartItems } from '@/store/slices/cartSlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartPageItem from './CartPageItem';
import CartSummary from './CartSummary';

const CartTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showShadow, setShowShadow] = useState(false);
  const sentinelRef = useRef(null);

  // Danh sách các sản phẩm khả dụng
  const availableItems = items ? items.filter((item) => item.isAvailable !== false) : [];
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi sentinel không còn trong view, tức là CartSummary đã sticky
        setShowShadow(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  const handleSelectAll = () => {
    // Filter available items
    const availableItemIds = availableItems.map((item) => item._id);

    // Check if all available items are already selected
    const allAvailableSelected =
      availableItemIds.length > 0 && availableItemIds.every((id) => selectedItems.includes(id));

    if (allAvailableSelected) {
      // If all available items are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all available items
      setSelectedItems(availableItemIds);
    }
  };

  const calculateSelectedTotal = () => {
    return items
      .filter((item) => selectedItems.includes(item._id))
      .reduce((total, item) => total + item.snapshot.price * item.quantity, 0);
  };

  const handleRemoveMultipleItems = (itemIds) => {
    dispatch(removeMultipleCartItems(itemIds))
      .unwrap()
      .then(() => message.success('Xóa sản phẩm thành công'))
      .catch((err) => message.error('Xóa sản phẩm thất bại: ' + err));
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Lọc các sản phẩm đã được chọn và khả dụng
    const selectedProducts = items.filter((item) => selectedItems.includes(item._id) && item.isAvailable !== false);

    // Kiểm tra nếu không có sản phẩm khả dụng nào được chọn
    if (selectedProducts.length === 0) {
      message.error('Không thể thanh toán vì tất cả sản phẩm đã chọn đều không khả dụng');
      return;
    }

    // Lưu các sản phẩm đã chọn vào localStorage
    localStorage.setItem('orderItems', JSON.stringify(selectedProducts));

    // Đặt các sản phẩm đã chọn vào trạng thái đơn hàng
    dispatch(setOrderItems(selectedProducts));

    // Chuyển hướng đến trang thanh toán
    navigate('/checkout');
  };

  // Kiểm tra xem tất cả các sản phẩm khả dụng đã được chọn hay chưa
  const isAllAvailableSelected =
    availableItems.length > 0 && availableItems.every((item) => selectedItems.includes(item._id));

  return (
    <div className='flex flex-col gap-8'>
      <div className='rounded-sm bg-white p-4'>
        <div className='grid-cols-12 items-center gap-2 border-b text-sm uppercase text-primaryColor md:grid'>
          <div className='flex items-center justify-between px-2 py-4'>
            <input
              type='checkbox'
              checked={isAllAvailableSelected}
              onChange={handleSelectAll}
              className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
            />
            {/* <button className='md:hidden'>xóa all</button> */}
          </div>
          <div className='col-span-3 hidden justify-start md:flex'>Sản phẩm</div>
          <div className='col-span-1 hidden justify-center md:flex'>Phân loại</div>
          <div className='col-span-2 hidden justify-center text-center md:flex'>Đơn giá</div>
          <div className='col-span-2 hidden justify-center text-center md:flex'>Số lượng</div>
          <div className='col-span-2 hidden justify-center text-right md:flex'>Số tiền</div>
          <div className='col-span-1 hidden justify-center text-center md:flex'>Thao tác</div>
        </div>
        <div className='space-y-4 lg:space-y-0'>
          {items?.map((item) => (
            <CartPageItem
              key={item._id}
              item={item}
              onSelect={handleSelectItem}
              isSelected={selectedItems.includes(item._id)}
            />
          ))}
        </div>
      </div>
      <div
        className={`sticky bottom-0 transition-shadow ${showShadow ? 'shadow-[0_-10px_10px_-3px_rgba(0,0,0,0.1)]' : ''}`}
      >
        <CartSummary
          subtotal={calculateSelectedTotal()}
          total={calculateSelectedTotal()}
          selectedCount={selectedItems.length}
          onNavigateToCheckout={handleProceedToCheckout}
          onSelectAll={handleSelectAll}
          onRemoveMultipleItems={handleRemoveMultipleItems}
          isSelectedAll={isAllAvailableSelected}
          cartItems={items}
          selectedItems={selectedItems}
          loading={loading}
        />
      </div>
      <div ref={sentinelRef} className='sentinel h-1 w-full'></div>
    </div>
  );
};

export default CartTable;
