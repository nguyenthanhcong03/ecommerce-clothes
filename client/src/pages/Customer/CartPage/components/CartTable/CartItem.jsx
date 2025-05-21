import { Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatCurrency } from '@/utils/format/formatCurrency';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';

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

export default CartItem;
