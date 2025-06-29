import VNPayLogo from '@/assets/images/vnpay-logo-vinadesign-25-12-59-16.jpg';
import { setPaymentMethod } from '@/store/slices/orderSlice';
import { Truck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng tại địa chỉ giao hàng',
    icon: <Truck size={24} className='text-amber-500' />,
    value: 'COD'
  },
  {
    id: 'VNPay',
    label: 'VNPay',
    description: 'Thanh toán trực tuyến qua cổng thanh toán VNPay',
    icon: <img width={24} src={VNPayLogo} alt='VNPay Logo' />,
    value: 'VNPay'
  }
];

const PaymentMethod = () => {
  const dispatch = useDispatch();
  const { paymentMethod } = useSelector((state) => state.order);

  const handleSetPaymentMethod = (method) => {
    dispatch(setPaymentMethod(method));
  };
  return (
    <div className='rounded-sm bg-white p-6'>
      <h2 className='mb-6 text-xl font-bold'>Phương thức thanh toán</h2>

      <div className='space-y-3'>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-4 rounded-sm border p-4 transition-all ${
              paymentMethod === method.value
                ? 'border-primaryColor bg-[#f3f3f3]'
                : 'hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              type='radio'
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={() => handleSetPaymentMethod(method.value)}
              className='mt-1 h-5 w-5 cursor-pointer accent-primaryColor'
            />

            <div className='flex-shrink-0'>{method.icon}</div>

            <div className='flex-1'>
              <div className='font-medium'>{method.label}</div>
              <p className='mt-1 text-sm text-gray-600'>{method.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
