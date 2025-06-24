// import boxIcon from '@/assets/icons/boxIcon.svg';
// import creditCardIcon from '@/assets/icons/debitCardIcon.svg';
// import truckIcon from '@/assets/icons/truckIcon.svg';
// import { formatCurrency } from '@/utils/format/formatCurrency';
// import { formatDate } from '@/utils/format/formatDate';
// import { translateOrderStatus } from '@/utils/helpers/orderStatusUtils';
// import { ArrowLeft, Clock, MapPin, Package, Printer } from 'lucide-react';
// import { memo, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';

// import MomoLogo from '@/assets/images/momo_icon_square_pinkbg@3x.png';
// import VNPayLogo from '@/assets/images/vnpay-logo-vinadesign-25-12-59-16.jpg';

// // Component hiển thị thông tin từng sản phẩm trong đơn hàng
// const OrderProductItem = memo(({ product }) => {
//   const price = product.snapshot?.originalPrice || product.snapshot?.price || 0;

//   return (
//     <div className='flex items-start space-x-4 border-b py-4 last:border-b-0'>
//       <div className='h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
//         <img
//           className='h-full w-full object-cover object-center'
//           src={product.snapshot?.image}
//           alt={product.snapshot?.name}
//         />
//       </div>

//       <div className='flex flex-1 flex-col'>
//         <div className='flex justify-between'>
//           <div>
//             <h4 className='text-base font-medium text-gray-900'>{product.snapshot?.name}</h4>
//             <p className='mt-1 text-sm text-gray-500'>
//               {product.snapshot?.color && <span>Màu: {product.snapshot?.color}</span>}
//               {product.snapshot?.size && <span> | Size: {product.snapshot?.size}</span>}
//             </p>
//           </div>
//           <div className='text-right'>
//             <p className='font-medium text-gray-900'>{formatCurrency(price * product.quantity)}</p>
//             <p className='text-sm text-gray-500'>
//               {product.quantity} x {formatCurrency(price)}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// const OrderSuccess = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const order = useSelector((state) => state.order.currentOrder);
//   const shippingInfo = useSelector((state) => state.order.shippingInfo);

//   useEffect(() => {
//     // Nếu không có thông tin đơn hàng và người dùng truy cập trực tiếp trang này,
//     // chuyển hướng về trang chủ sau 5 giây
//     if (!order) {
//       const timer = setTimeout(() => {
//         navigate('/');
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [order, navigate]);

//   // Chọn icon phù hợp với phương thức thanh toán
//   const getPaymentIcon = (method) => {
//     switch (method) {
//       case 'COD':
//         return <img src={boxIcon} alt='COD' className='mr-2 h-6 w-6' />;
//       case 'VNPay':
//         return <img src={VNPayLogo} alt='Thanh toán trực tuyến qua cổng thanh toán VNPay' className='mr-2 h-6 w-6' />;

//       case 'Momo':
//         return <img src={MomoLogo} alt='Thanh toán trực tuyến an toàn qua Momo' className='mr-2 h-6 w-6' />;
//       default:
//         return <img src={creditCardIcon} alt='Payment' className='mr-2 h-6 w-6' />;
//     }
//   };

//   if (!order) {
//     return (
//       <div className='flex flex-col items-center justify-center py-16 text-center'>
//         <div className='mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600'></div>
//         <h2 className='mb-2 text-2xl font-medium text-gray-700'>Đang tải thông tin đơn hàng...</h2>
//         <p className='text-gray-500'>
//           Vui lòng đợi hoặc{' '}
//           <Link to='/user/order' className='text-blue-600 hover:underline'>
//             xem lịch sử đơn hàng
//           </Link>
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className='mx-auto max-w-4xl px-4 py-[120px] sm:px-6 lg:px-8'>
//       {/* Header thành công */}
//       <div className='mb-8 text-center'>
//         <div className='mb-6 flex items-center justify-center'>
//           <div className='rounded-full bg-green-100 p-3'>
//             <div className='rounded-full bg-green-500 p-3'>
//               <svg
//                 className='h-8 w-8 text-white'
//                 fill='none'
//                 stroke='currentColor'
//                 viewBox='0 0 24 24'
//                 xmlns='http://www.w3.org/2000/svg'
//               >
//                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
//               </svg>
//             </div>
//           </div>
//         </div>
//         <h2 className='mb-2 text-3xl font-bold text-green-600'>Đặt hàng thành công!</h2>
//         <p className='text-lg text-gray-600'>Cảm ơn bạn đã mua sắm cùng chúng tôi!</p>
//       </div>

//       {/* Chi tiết đơn hàng */}
//       <div className='overflow-hidden rounded-lg bg-white shadow'>
//         {/* Thông tin đơn hàng */}
//         <div className='border-b border-gray-200 bg-gray-50 px-4 py-6 sm:px-6'>
//           <div className='flex flex-wrap items-center justify-between gap-3'>
//             <div>
//               <h3 className='text-lg font-medium leading-6 text-gray-900'>Chi tiết đơn hàng</h3>
//               <p className='mt-1 text-sm text-gray-500'>
//                 Đơn hàng được tạo vào lúc {formatDate(order.data?.createdAt || new Date())}
//               </p>
//             </div>
//             <div className='flex items-center gap-3'>
//               <button
//                 type='button'
//                 onClick={() => window.print()}
//                 className='inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
//               >
//                 <Printer className='mr-2 h-4 w-4' />
//                 In hóa đơn
//               </button>
//               <Link
//                 to='/user/order'
//                 className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
//               >
//                 <Clock className='mr-2 h-4 w-4' />
//                 Theo dõi đơn hàng
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Nội dung */}
//         <div className='px-4 py-5 sm:p-6'>
//           {/* Thông tin cơ bản */}
//           <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//             <div className='rounded-lg bg-gray-50 p-4 transition duration-200 hover:bg-gray-100'>
//               <div className='flex items-center'>
//                 <Package className='mr-3 h-6 w-6 text-gray-400' />
//                 <div>
//                   <p className='text-sm font-medium text-gray-500'>Mã đơn hàng</p>
//                   <p className='mt-1 font-mono text-lg font-semibold text-blue-600'>
//                     {order.data?._id?.slice(-8).toUpperCase() || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className='rounded-lg bg-gray-50 p-4 transition duration-200 hover:bg-gray-100'>
//               <div className='flex items-center'>
//                 <Clock className='mr-3 h-6 w-6 text-gray-400' />
//                 <div>
//                   <p className='text-sm font-medium text-gray-500'>Trạng thái</p>
//                   <div className='mt-1'>
//                     <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
//                       {translateOrderStatus(order.data?.status || 'Processing')}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className='rounded-lg bg-gray-50 p-4 transition duration-200 hover:bg-gray-100'>
//               <div className='flex items-center'>
//                 <svg
//                   className='mr-3 h-6 w-6 text-gray-400'
//                   xmlns='http://www.w3.org/2000/svg'
//                   fill='none'
//                   viewBox='0 0 24 24'
//                   stroke='currentColor'
//                 >
//                   <path
//                     strokeLinecap='round'
//                     strokeLinejoin='round'
//                     strokeWidth='2'
//                     d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
//                   />
//                 </svg>
//                 <div>
//                   <p className='text-sm font-medium text-gray-500'>Tổng cộng</p>
//                   <p className='mt-1 text-lg font-semibold text-gray-900'>
//                     {formatCurrency(order.data?.totalPrice || 0)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Thông tin giao hàng */}
//           <div className='mt-8'>
//             <div className='mb-4 flex items-center'>
//               <img src={truckIcon} alt='Shipping' className='mr-2 h-5 w-5' />
//               <h3 className='text-lg font-medium text-gray-900'>Thông tin giao hàng</h3>
//             </div>

//             <div className='rounded-lg bg-gray-50 p-4'>
//               <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
//                 <div>
//                   <p className='text-base font-medium text-gray-900'>{shippingInfo?.fullName || 'N/A'}</p>
//                   <p className='mt-2 text-sm text-gray-500'>
//                     {shippingInfo?.street || 'N/A'}
//                     <br />
//                     {shippingInfo?.ward}, {shippingInfo?.district}, {shippingInfo?.province}
//                   </p>
//                   <p className='mt-2 text-sm text-gray-500'>
//                     <span className='font-medium'>Điện thoại:</span> {shippingInfo?.phoneNumber || 'N/A'}
//                   </p>
//                   <p className='text-sm text-gray-500'>
//                     <span className='font-medium'>Email:</span> {shippingInfo?.email || 'N/A'}
//                   </p>
//                 </div>

//                 <div className='mt-4 sm:mt-0'>
//                   <div className='flex items-center'>
//                     {getPaymentIcon(order.data?.payment?.method)}
//                     <div>
//                       <p className='text-sm font-medium text-gray-900'>Phương thức thanh toán</p>
//                       <p className='text-sm text-gray-500'>
//                         {order.data?.payment?.method === 'COD'
//                           ? 'Thanh toán khi nhận hàng'
//                           : order.data?.payment?.method || 'N/A'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {order.data?.trackingNumber && (
//                 <div className='mt-4 rounded-md border border-blue-100 bg-blue-50 p-3'>
//                   <div className='flex items-center'>
//                     <MapPin className='mr-2 h-5 w-5 text-blue-700' />
//                     <div>
//                       <p className='text-sm font-medium text-blue-800'>Mã vận đơn:</p>
//                       <p className='font-mono text-sm font-bold text-blue-900'>{order.data.trackingNumber}</p>
//                       <p className='mt-1 text-xs text-blue-600'>
//                         Sử dụng mã này để theo dõi đơn hàng của bạn trên trang web của đơn vị vận chuyển
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Danh sách sản phẩm */}
//           {order.data?.products && order.data.products.length > 0 && (
//             <div className='mt-8'>
//               <div className='mb-4 flex items-center'>
//                 <Package className='mr-2 h-5 w-5 text-gray-500' />
//                 <h3 className='text-lg font-medium text-gray-900'>Sản phẩm đã đặt ({order.data.products.length})</h3>
//               </div>

//               <div className='overflow-hidden rounded-lg border bg-white'>
//                 <div className='divide-y divide-gray-200'>
//                   {order.data.products.map((product) => (
//                     <OrderProductItem key={product.variantId} product={product} />
//                   ))}
//                 </div>

//                 {/* Tổng kết đơn hàng */}
//                 <div className='bg-gray-50 p-4'>
//                   <div className='flex justify-between text-base font-medium text-gray-900'>
//                     <p>Tạm tính</p>
//                     <p>{formatCurrency(order.data.totalPrice - order.data.shippingCost)}</p>
//                   </div>
//                   {order.data.discountAmount > 0 && (
//                     <div className='flex justify-between py-1 text-base font-medium text-gray-900'>
//                       <p>Giảm giá</p>
//                       <p className='text-red-600'>- {formatCurrency(order.data.discountAmount)}</p>
//                     </div>
//                   )}
//                   <div className='flex justify-between py-1 text-base font-medium text-gray-900'>
//                     <p>Phí vận chuyển</p>
//                     <p>{formatCurrency(order.data.shippingCost || 0)}</p>
//                   </div>
//                   <div className='flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold'>
//                     <p>Tổng cộng</p>
//                     <p className='text-blue-600'>{formatCurrency(order.data.totalPrice || 0)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Ghi chú và thông tin thêm */}
//           {order.data?.note && (
//             <div className='mt-6 rounded-md bg-gray-50 p-4'>
//               <h4 className='text-sm font-medium text-gray-900'>Ghi chú đơn hàng:</h4>
//               <p className='mt-1 whitespace-pre-wrap text-sm text-gray-600'>{order.data.note}</p>
//             </div>
//           )}

//           <div className='mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4'>
//             <div className='flex items-start'>
//               <svg
//                 className='mr-3 h-5 w-5 flex-shrink-0 text-yellow-500'
//                 xmlns='http://www.w3.org/2000/svg'
//                 viewBox='0 0 20 20'
//                 fill='currentColor'
//               >
//                 <path
//                   fillRule='evenodd'
//                   d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z'
//                   clipRule='evenodd'
//                 />
//               </svg>
//               <div className='text-sm text-yellow-700'>
//                 <p className='font-medium'>Thông tin giao hàng</p>
//                 <p className='mt-1'>
//                   Đơn hàng của bạn sẽ được xử lý và giao trong vòng 3-5 ngày làm việc. Bạn sẽ nhận được email thông báo
//                   khi đơn hàng được giao cho đơn vị vận chuyển.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className='border-t border-gray-200 bg-gray-50 px-4 py-5 sm:px-6'>
//           <div className='flex flex-col items-center justify-center space-y-3 text-center'>
//             <Link
//               to='/'
//               className='inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50'
//             >
//               <ArrowLeft className='mr-2 h-4 w-4' />
//               Tiếp tục mua sắm
//             </Link>

//             <Link to='/user/order' className='text-sm text-blue-600 hover:underline'>
//               Xem lịch sử đơn hàng
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// OrderProductItem.displayName = 'OrderProductItem';
// OrderSuccess.displayName = 'OrderSuccess';

// export default OrderSuccess;

import React from 'react';

const OrderSuccess = () => {
  return <div className='pt-96'>OrderSuccess</div>;
};

export default OrderSuccess;
