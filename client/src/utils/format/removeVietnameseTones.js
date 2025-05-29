function removeVietnameseTones(str) {
  return str
    .normalize('NFD') // Tách các ký tự có dấu thành ký tự + dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/đ/g, 'd') // chuyển đ thành d
    .replace(/Đ/g, 'D') // chuyển Đ thành D
    .trim(); // Xóa khoảng trắng đầu/cuối
}
export default removeVietnameseTones;
