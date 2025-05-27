import MomoLogo from '@/assets/images/momo_icon_square_pinkbg@3x.png';
import VNPayLogo from '@/assets/images/vnpay-logo-vinadesign-25-12-59-16.jpg';
import { Truck } from 'lucide-react';

const PaymentMethod = ({ register, errors, watch }) => {
  const watchedPaymentMethod = watch('paymentMethod');

  // Payment method options with icons
  const paymentMethods = [
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
    },
    {
      id: 'Momo',
      label: 'Momo',
      description: 'Thanh toán trực tuyến an toàn qua Momo>',
      icon: <img width={24} src={MomoLogo} alt=' Momo Logo' />,
      value: 'Momo'
    }
  ];

  return (
    <div className='rounded-sm bg-white p-6'>
      <h2 className='mb-6 text-xl font-bold'>Phương thức thanh toán</h2>

      <div className='space-y-3'>
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-4 rounded-sm border p-4 transition-all ${
              watchedPaymentMethod === method.id
                ? 'border-primaryColor bg-[#f3f3f3]'
                : 'hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              type='radio'
              value={method.id}
              {...register('paymentMethod')}
              className='mt-1 h-5 w-5 cursor-pointer accent-primaryColor'
            />

            <div className='flex-shrink-0'>{method.icon}</div>

            <div className='flex-1'>
              <div className='font-medium'>{method.label}</div>
              <p className='mt-1 text-sm text-gray-600'>{method.description}</p>
            </div>
          </label>
        ))}

        {errors.paymentMethod && <p className='mt-2 text-sm text-red-600'>{errors.paymentMethod.message}</p>}
      </div>
    </div>
  );
};

export default PaymentMethod;
