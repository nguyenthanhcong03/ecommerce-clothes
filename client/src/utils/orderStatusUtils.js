/**
 * Các hàm tiện ích để xử lý trạng thái đơn hàng
 */

// Định nghĩa màu cho các trạng thái đơn hàng
export const statusColors = {
  Pending: 'gold',
  Processing: 'blue',
  Shipping: 'cyan',
  Delivered: 'green',
  Cancelled: 'red'
};

// Chuyển đổi tiếng Anh sang tiếng Việt
export const statusTranslations = {
  Pending: 'Đang chờ xử lý',
  Processing: 'Đang xử lý',
  Shipping: 'Đang giao hàng',
  Delivered: 'Đã giao hàng',
  Cancelled: 'Đã hủy'
};

// Danh sách các trạng thái đơn hàng
export const orderStatuses = [
  { value: 'Pending', label: 'Đang chờ xử lý', color: 'gold' },
  { value: 'Processing', label: 'Đang xử lý', color: 'blue' },
  { value: 'Shipping', label: 'Đang giao hàng', color: 'cyan' },
  { value: 'Delivered', label: 'Đã giao hàng', color: 'green' },
  { value: 'Cancelled', label: 'Đã hủy', color: 'red' }
];

/**
 * Kiểm tra xem đơn hàng có thể chuyển sang trạng thái mới không
 * @param {string} currentStatus - Trạng thái hiện tại của đơn hàng
 * @param {string} newStatus - Trạng thái mới mà người dùng muốn chuyển sang
 * @returns {boolean} - true nếu có thể chuyển trạng thái, ngược lại là false
 */
export const canChangeStatus = (currentStatus, newStatus) => {
  console.log('currentStatus', currentStatus);
  console.log('newStatus', newStatus);
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
 * @param {string} currentStatus - Trạng thái hiện tại của đơn hàng
 * @returns {Array} - Mảng các trạng thái hợp lệ
 */
export const getValidStatusTransitions = (currentStatus) => {
  return orderStatuses.filter((status) => canChangeStatus(currentStatus, status.value));
};

export default {
  statusColors,
  statusTranslations,
  orderStatuses,
  canChangeStatus,
  getValidStatusTransitions
};
