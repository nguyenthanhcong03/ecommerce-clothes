import { removeMultipleCartItems, updateCartItem } from '@/store/slices/cartSlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import PaymentMethods from './PaymentMethods';

const CartTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalCartItems, totalPrice, loading } = useSelector((state) => state.cart);
  const [selectedItems, setSelectedItems] = useState(items.map((item) => item._id));
  const [showShadow, setShowShadow] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi sentinel không còn trong view, tức là CartSummary đã sticky
        setShowShadow(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
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
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item._id));
    }
  };

  const calculateSelectedTotal = () => {
    return items
      .filter((item) => selectedItems.includes(item._id))
      .reduce((total, item) => total + item.snapshot.price * item.quantity, 0);
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (!newQuantity) return;
    console.log('quantity', newQuantity);
    dispatch(
      updateCartItem({
        productId: item.productId,
        variantId: item.variantId,
        quantity: newQuantity
      })
    )
      .unwrap()
      .then(() => toast.success('Cập nhật số lượng thành công'))
      .catch((err) => toast.error('Cập nhật số lượng thất bại: ' + err));
  };

  const handleRemoveMultipleItems = (itemIds) => {
    dispatch(removeMultipleCartItems(itemIds))
      .unwrap()
      .then(() => toast.success('Xóa sản phẩm thành công'))
      .catch((err) => toast.error('Xóa sản phẩm thất bại: ' + err));
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Lọc các sản phẩm đã được chọn
    const selectedProducts = items.filter((item) => selectedItems.includes(item._id));

    // Lưu các sản phẩm đã chọn vào localStorage
    localStorage.setItem('orderItems', JSON.stringify(selectedProducts));

    // Đặt các sản phẩm đã chọn vào trạng thái đơn hàng
    dispatch(setOrderItems(selectedProducts));

    // Chuyển hướng đến trang thanh toán
    navigate('/checkout');
  };

  return (
    <div>
      <div className='flex flex-col gap-8'>
        <div className='rounded-sm bg-white px-4'>
          <div className='grid-cols-12 items-center gap-2 border-b text-sm uppercase text-primaryColor md:grid'>
            <div className='flex items-center justify-between px-2 py-4'>
              <input
                type='checkbox'
                checked={selectedItems.length === items?.length}
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
              <CartItem
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
            isSelectedAll={selectedItems.length === items?.length}
            cartItems={items}
            selectedItems={selectedItems}
            loading={loading}
          />
        </div>
        <div ref={sentinelRef} className='sentinel h-1 w-full'></div>
      </div>
      <PaymentMethods />
    </div>
  );
};

export default CartTable;
