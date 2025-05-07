import React from 'react';

const PAYMENT_METHODS = [
  {
    name: 'Visa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png'
  },
  {
    name: 'Mastercard',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png'
  },
  {
    name: 'PayPal',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
  },
  {
    name: 'MoMo',
    image: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
  },
  {
    name: 'ZaloPay',
    image: 'https://upload.wikimedia.org/wikipedia/vi/7/77/ZaloPay_Logo.png'
  }
];

const PaymentMethods = () => {
  return (
    <div className='mt-8 text-center'>
      <div className='mb-4 space-y-2'>
        <p className='text-sm uppercase tracking-widest text-gray-700'>
          Thanh toán <span className='text-green-500'>an toàn</span>
        </p>
        <p className='text-xs text-gray-500'>Thông tin thanh toán của bạn được bảo mật</p>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-6'>
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.name}
            className='group relative h-8 w-16 cursor-pointer transition-transform hover:scale-105'
          >
            <img
              src={method.image}
              alt={method.name}
              className='h-full w-full object-contain grayscale transition-all group-hover:grayscale-0'
            />
            <div className='absolute inset-0 rounded border border-transparent transition-colors group-hover:border-gray-200' />
          </div>
        ))}
      </div>

      <div className='mt-4 flex items-center justify-center gap-2 text-xs text-gray-500'>
        <span>🔒</span>
        <p>Thanh toán được mã hóa 256-bit SSL</p>
      </div>
    </div>
  );
};

export default PaymentMethods;
