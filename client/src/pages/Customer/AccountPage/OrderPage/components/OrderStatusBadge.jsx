import { AlertCircle, CheckCircle, Clock, CreditCard, Package, TruckIcon } from 'lucide-react';

const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Unpaid':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: <CreditCard className='h-4 w-4' />,
          text: 'Chưa thanh toán'
        };
      case 'Pending':
        return { color: 'bg-amber-100 text-amber-800', icon: <Clock className='h-4 w-4' />, text: 'Chờ xác nhận' };
      case 'Processing':
        return { color: 'bg-blue-100 text-blue-800', icon: <Package className='h-4 w-4' />, text: 'Đang xử lý' };
      case 'Shipping':
        return {
          color: 'bg-indigo-100 text-indigo-800',
          icon: <TruckIcon className='h-4 w-4' />,
          text: 'Đang giao hàng'
        };
      case 'Delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className='h-4 w-4' />,
          text: 'Đã giao hàng'
        };
      case 'Cancelled':
        return { color: 'bg-red-100 text-red-800', icon: <AlertCircle className='h-4 w-4' />, text: 'Đã hủy' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className='h-4 w-4' />, text: 'Không xác định' };
    }
  };

  const { color, icon, text } = getStatusConfig();

  return (
    <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${color}`}>
      {icon}
      <span className='ml-1.5'>{text}</span>
    </div>
  );
};

export default OrderStatusBadge;
