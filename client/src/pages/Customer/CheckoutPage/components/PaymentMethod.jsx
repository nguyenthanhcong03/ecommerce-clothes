import React from 'react';
import { CreditCard, DollarSign, Truck } from 'lucide-react';

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
      icon: (
        <svg
          width='24'
          height='24'
          viewBox='0 0 120 120'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='text-blue-600'
        >
          <path
            d='M102.281 7.84631C96.1518 7.84631 91.1741 12.8499 91.1741 19.0104C91.1741 25.171 96.1518 30.1747 102.281 30.1747C108.411 30.1747 113.388 25.171 113.388 19.0104C113.389 12.8499 108.411 7.84631 102.281 7.84631Z'
            fill='#D7202C'
          />
          <path
            d='M90.9297 7.84631C84.8004 7.84631 79.8232 12.8499 79.8232 19.0104C79.8232 25.171 84.8004 30.1747 90.9297 30.1747C97.0591 30.1747 102.037 25.171 102.037 19.0104C102.037 12.8499 97.0591 7.84631 90.9297 7.84631Z'
            fill='#1749A4'
          />
          <path
            d='M120 45.6038V35.2711C116.008 32.3759 111.117 30.8257 106.148 30.8257C93.3176 30.8257 82.5073 39.1763 81.0596 50.5905C60.2738 50.2183 60.0764 50.1973 60.0764 50.1973V61.1973H80.0344V95.2102H94.1006V61.1973H120V50.1973H94.1006V49.3344C94.1006 41.8689 99.623 35.8929 106.148 35.8929C110.879 35.8929 115.499 39.841 115.499 39.841L120 45.6038Z'
            fill='#1749A4'
          />
          <path
            d='M60.0766 119.004V69.9974C60.0766 69.9974 32.5482 69.8219 31.0059 69.8219C20.5814 69.8219 12.4178 78.0374 12.4178 88.5242C12.4178 93.5401 14.4703 98.0658 17.7743 101.386L3.86764 115.371L14.1308 120.004C14.1308 120.004 29.8439 104.196 31.0059 102.991C31.3455 102.972 31.6902 102.949 32.0399 102.949C43.6713 102.949 49.9384 95.2949 49.9384 88.5242C49.9384 88.4383 49.9384 87.1789 49.9384 87.1789H35.2552V99.8764H30.5216C25.3767 99.8764 21.1849 94.6773 21.1849 88.5242C21.1849 82.3711 25.3767 77.172 30.5216 77.172C31.3705 77.172 60.0766 77.2011 60.0766 77.2011V61.1974H27C12.0883 61.1974 0 74.3313 0 89.3475C0 96.5782 2.99805 103.176 7.83448 107.895L0 115.785V119.723L13.0854 106.56C18.7723 111.278 26.0851 114.047 34.337 114.047C36.2648 114.047 38.0928 113.86 39.9159 113.567C41.3636 112.109 60.0766 92.0885 60.0766 92.0885V119.004H75.0878V61.1974H60.0766V119.004Z'
            fill='#1749A4'
          />
        </svg>
      ),
      value: 'VNPay'
    },
    {
      id: 'Momo',
      label: 'Momo',
      description: 'Thanh toán trực tuyến an toàn qua Momo>',
      // icon: <Paypal size={24} className='text-blue-800' />,
      value: 'Momo'
    }
  ];

  return (
    <div className='rounded-sm border bg-white p-6'>
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
