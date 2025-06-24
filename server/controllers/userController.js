const userService = require("../services/userService");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

// Lấy danh sách người dùng với phân trang và lọc
const getAllUsers = catchAsync(async (req, res) => {
  const filters = {
    role: req.query.role,
    isBlocked: req.query.isBlocked,
    search: req.query.search,
  };

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder === "asc" ? 1 : -1,
  };

  const result = await userService.getAllUsers(filters, options);
  res.status(200).json(result);
});

// Lấy thông tin của một người dùng
const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

// Lấy thông tin người dùng hiện tại
const getCurrentUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// Tạo người dùng mới bởi Admin
const createUserByAdmin = catchAsync(async (req, res) => {
  // Kiểm tra quyền: chỉ admin mới có thể tạo người dùng
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Permission denied");
  }

  const user = await userService.createUserByAdmin(req.body);

  // Trả về kết quả với mật khẩu gốc nếu đã được tạo ngẫu nhiên
  res.status(201).json({
    success: true,
    data: user,
    message: "User created successfully",
  });
});

// Cập nhật thông tin người dùng
const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // Kiểm tra quyền: admin có thể cập nhật bất kỳ user nào, user thường chỉ có thể cập nhật chính mình
  if (req.user.role !== "admin" && req.user.id !== userId) {
    throw new ApiError(403, "Truy cập bị từ chối");
  }

  // Chuyển việc xác thực dữ liệu sang service
  const updatedUser = await userService.updateUser(userId, req.body, req.user.id);
  res.status(200).json({ success: true, data: updatedUser });
});

// Cập nhật thông tin người dùng bởi Admin
const updateUserByAdmin = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // Kiểm tra quyền: chỉ admin mới có quyền
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Truy cập bị từ chối");
  }

  const updatedUser = await userService.updateUserByAdmin(userId, req.body);
  res.status(200).json({
    success: true,
    data: updatedUser,
    message: "Cập nhật người dùng thành công",
  });
});

// Xóa người dùng (chỉ admin mới có quyền)
const deleteUser = catchAsync(async (req, res) => {
  // Kiểm tra quyền: chỉ admin mới có thể xóa user
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Truy cập bị từ chối");
  }

  const result = await userService.deleteUser(req.params.id);
  res.status(200).json(result);
});

// Thay đổi mật khẩu
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const result = await userService.changePassword(userId, currentPassword, newPassword);
  res.status(200).json(result);
});

// Chặn người dùng
const banUser = catchAsync(async (req, res) => {
  // Kiểm tra quyền: chỉ admin mới có thể chặn người dùng
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Permission denied");
  }

  const userId = req.params.id;
  const banInfo = req.body;

  const user = await userService.banUser(userId, banInfo);
  res.status(200).json({
    success: true,
    data: user,
    message: "User has been banned successfully",
  });
});

// Bỏ chặn người dùng
const unbanUser = catchAsync(async (req, res) => {
  // Kiểm tra quyền: chỉ admin mới có thể bỏ chặn người dùng
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Permission denied");
  }

  const userId = req.params.id;
  const user = await userService.unbanUser(userId);

  res.status(200).json({
    success: true,
    data: user,
    message: "User has been unbanned successfully",
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUserByAdmin,
  updateUser,
  updateUserByAdmin,
  deleteUser,
  changePassword,
  banUser,
  unbanUser,
};
