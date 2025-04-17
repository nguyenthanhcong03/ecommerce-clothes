import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { removeCartItem, updateCartItem } from '@/redux/features/cart/cartSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { Pointer, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CartSummary from './CartSummary';
import PaymentMethods from './PaymentMethods';

const CartHeader = ({ onSelectAll, allSelected }) => (
  <div className='grid-cols-12 items-center gap-2 border-b text-sm uppercase text-primaryColor md:grid'>
    <div className='flex items-center justify-between px-2 py-4'>
      <input
        type='checkbox'
        checked={allSelected}
        onChange={onSelectAll}
        className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
      />
      <button className='md:hidden'>xóa all</button>
    </div>
    <div className='col-span-3 hidden justify-start md:flex'>Sản phẩm</div>
    <div className='col-span-1 hidden justify-center md:flex'>Phân loại</div>
    <div className='col-span-2 hidden justify-center text-center md:flex'>Đơn giá</div>
    <div className='col-span-2 hidden justify-center text-center md:flex'>Số lượng</div>
    <div className='col-span-2 hidden justify-center text-right md:flex'>Số tiền</div>
    <div className='col-span-1 hidden justify-center text-center md:flex'>Thao tác</div>
  </div>
);

const CartItem = ({ item, onQuantityChange, onRemove, onSelect, isSelected }) => {
  const { loadingUpdate, itemUpdate } = useSelector((state) => state.cart);
  const isUpdating = loadingUpdate && itemUpdate?._id === item._id;
  return (
    <div className='flex flex-col gap-4 border-b px-2 py-4'>
      {/* Mobile view - cart item */}
      <div className='flex items-center justify-start gap-2 md:hidden'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={() => onSelect(item._id)}
            className='h-4 w-4 rounded border-gray-300 accent-primaryColor'
          />
        </div>
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <img src={item.snapshot.image} alt={item.snapshot.name} className='h-24 w-20 object-cover' />
            <div className='flex flex-1 flex-col justify-start gap-3'>
              <div className='text-sm'>{item.snapshot.name}</div>
              <div className='text-sm text-gray-600'>
                {item.snapshot.size}, {item.snapshot.color}
              </div>
              <div className='text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
            </div>
          </div>
          <div className='flex h-[96px] flex-col justify-between'>
            <div className='flex items-center justify-end gap-2 hover:opacity-80'>
              <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => onRemove(item._id)} />
            </div>

            <div className={`${isUpdating ? 'opacity-50' : ''}`}>
              <QuantityInput
                size='small'
                value={item.quantity}
                onChange={(qty) => onQuantityChange(item, qty)}
                min={1}
                max={10}
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
        />
        <div className='col-span-3 flex items-center justify-start gap-4'>
          <img src={item.snapshot.image} alt={item.snapshot.name} className='h-24 w-20 object-cover md:h-20 md:w-16' />
          <div className='text-sm'>{item.snapshot.name}</div>
        </div>
        <div className='col-span-1 text-center text-sm text-gray-600'>
          {item.snapshot.size}, {item.snapshot.color}
        </div>
        <div className='col-span-2 text-right text-gray-600'>{formatCurrency(item.snapshot.price)}</div>
        <div className={`col-span-2 flex items-center justify-center ${isUpdating ? 'opacity-50' : ''}`}>
          <QuantityInput
            size='small'
            value={item.quantity}
            onChange={(qty) => onQuantityChange(item, qty)}
            disabled={isUpdating}
            min={1}
            max={10}
          />
        </div>
        <div className={`col-span-2 text-right text-sm font-medium ${isUpdating ? 'opacity-50' : ''}`}>
          {formatCurrency(item.snapshot.price * item.quantity)}
        </div>
        <div className='flex items-center justify-end gap-2 hover:opacity-80'>
          <Trash2 strokeWidth={1.5} cursor={'pointer'} width={20} onClick={() => onRemove(item._id)} />
        </div>
      </div>
    </div>
  );
};

const CartTable = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice, loading } = useSelector((state) => state.cart);
  const [selectedItems, setSelectedItems] = useState(items.map((item) => item._id));

  // useEffect(() => {
  //   dispatch(getCart());
  //   console.log('rểnder');
  // }, [dispatch]);

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

  const handleQuantityChange = async (item, newQuantity) => {
    try {
      await dispatch(
        updateCartItem({
          productId: item.productId,
          variantId: item.variantId,
          quantity: newQuantity
        })
      ).unwrap();
    } catch (error) {
      toast.error('Cập nhật số lượng thất bại');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <div className='mx-auto max-w-[1280px] px-4 lg:p-8'>
      <div className='flex flex-col gap-8'>
        <div className=''>
          <CartHeader onSelectAll={handleSelectAll} allSelected={selectedItems.length === items?.length} />
          <div className='space-y-4 lg:space-y-0'>
            {items?.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                onSelect={handleSelectItem}
                isSelected={selectedItems.includes(item._id)}
              />
            ))}
          </div>
        </div>
        <div className=''>
          <CartSummary
            subtotal={calculateSelectedTotal()}
            total={calculateSelectedTotal()}
            selectedCount={selectedItems.length}
          />
        </div>
      </div>
      <PaymentMethods />
    </div>
  );
};

export default CartTable;
