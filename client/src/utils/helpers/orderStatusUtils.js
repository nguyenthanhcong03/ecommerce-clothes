/**
 * Các hàm tiện ích để xử lý trạng thái đơn hàng
 */

// Hàm hỗ trợ chuyển đổi trạng thái đơn hàng sang tiếng Việt
export const translateOrderStatus = (status) => {
  switch (status) {
    case 'Unpaid':
      return 'Chưa thanh toán';
    case 'Pending':
      return 'Chờ xác nhận';
    case 'Processing':
      return 'Đang xử lý';
    case 'Shipping':
      return 'Đang giao hàng';
    case 'Delivered':
      return 'Đã giao hàng';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Đang xử lý';
  }
};

// Danh sách các trạng thái đơn hàng
export const orderStatuses = [
  { value: 'Pending', label: 'Chờ xác nhận' },
  { value: 'Processing', label: 'Đang xử lý' },
  { value: 'Shipping', label: 'Đang giao hàng' },
  { value: 'Delivered', label: 'Đã giao hàng' },
  { value: 'Cancelled', label: 'Đã hủy' }
];

/**
 * Kiểm tra xem đơn hàng có thể chuyển sang trạng thái mới không
 */
export const canChangeStatus = (currentStatus, newStatus) => {
  // Nếu đơn hàng đã bị hủy, không thể chuyển sang trạng thái khác
  if (currentStatus === 'Cancelled') {
    return false;
  }

  // Nếu đơn hàng đã giao, chỉ có thể hủy (trường hợp trả hàng)
  if (currentStatus === 'Delivered' && newStatus !== 'Cancelled') {
    return false;
  }

  // Các trạng thái theo thứ tự xử lý
  const statusOrder = ['Pending', 'Processing', 'Shipping', 'Delivered'];

  // Nếu chuyển sang trạng thái Cancelled, luôn được phép
  if (newStatus === 'Cancelled') {
    return true;
  }

  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  // Chỉ được phép chuyển sang trạng thái kế tiếp hoặc trước đó 1 bước
  return newIndex <= currentIndex + 1 && newIndex >= currentIndex - 1;
};

/**
 * Lấy các trạng thái hợp lệ mà đơn hàng có thể chuyển sang
 */
export const getValidStatusTransitions = (currentStatus) => {
  return orderStatuses.filter((status) => canChangeStatus(currentStatus, status.value));
};
