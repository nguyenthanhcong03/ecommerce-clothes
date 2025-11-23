const User = require("../models/user");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");

// Kiểm tra trùng lặp thông tin
const validateUserData = async (userData, userId = null) => {
  const { email, phone } = userData;
  const errors = [];

  // Kiểm tra email đã tồn tại chưa
  if (email) {
    const query = { email: email };
    if (userId) query._id = { $ne: userId };

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      errors.push({ field: "email", message: "Email đã tồn tại" });
    }
  }

  // Kiểm tra phone đã tồn tại chưa
  if (userData.phone) {
    const query = { phone: userData.phone };
    if (userId) query._id = { $ne: userId };

    const existingPhone = await User.findOne(query);
    if (existingPhone) {
      errors.push({ field: "phone", message: "Số điện thoại đã tồn tại" });
    }
  }

  return errors;
};

// Tìm tất cả người dùng với phân trang và lọc
const getAllUsers = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1 } = options;
  const skip = (page - 1) * limit;

  // Xây dựng query filters
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.isBlocked) query.isBlocked = filters.isBlocked;

  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: "i" } },
      { lastName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { username: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Thực hiện truy vấn
  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpires -verificationToken")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy một người dùng theo ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
  );
  if (!user) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }
  return user;
};

// Tạo người dùng mới bởi Admin
const createUserByAdmin = async (userData) => {
  const { firstName, lastName, email, username, phone, role, password } = userData;
  // Kiểm tra dữ liệu bắt buộc
  if (!firstName || !lastName || !email || !phone || !username || !role || !password) {
    throw new ApiError(400, "Thiếu thông tin bắt buộc: firstName, lastName, email, username, phone, role, password");
  }

  // Kiểm tra trùng lặp thông tin
  const validationErrors = await validateUserData(userData);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lỗi xác thực dữ liệu", validationErrors);
  }

  // Hash mật khẩu
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(password, salt);

  // Mặc định trạng thái active nếu không được cung cấp
  if (userData.isBlocked === undefined) {
    userData.isBlocked = false;
  }

  // Tạo người dùng mới
  const newUser = await User.create(userData);

  // Trả về thông tin người dùng mà không có mật khẩu
  const userToReturn = newUser.toObject();
  delete userToReturn.password;
  delete userToReturn.resetPasswordToken;
  delete userToReturn.resetPasswordExpires;
  delete userToReturn.verificationToken;

  return userToReturn;
};

// Cập nhật thông tin người dùng
const updateUser = async (userId, userData, currentUserId) => {
  // Kiểm tra trùng lặp thông tin
  const validationErrors = await validateUserData(userData, userId);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lỗi xác thực dữ liệu", validationErrors);
  }

  // Không cho phép cập nhật một số trường nhạy cảm qua phương thức này
  const { password, resetPasswordToken, resetPasswordExpires, verificationToken, role, ...updateData } = userData;

  // Chỉ admin mới có thể cập nhật role
  if (userData.role && currentUserId) {
    const currentUser = await User.findById(currentUserId);
    if (currentUser && currentUser.role === "admin") {
      updateData.role = userData.role;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
  );

  if (!updatedUser) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }

  return updatedUser;
};

// Cập nhật thông tin người dùng bởi Admin (có nhiều quyền hạn hơn)
const updateUserByAdmin = async (userId, userData) => {
  const { firstName, lastName, email, username, phone, role } = userData;
  // Kiểm tra dữ liệu bắt buộc
  if (!firstName || !lastName || !email || !phone || !username || !role) {
    throw new ApiError(400, "Thiếu thông tin bắt buộc: firstName, lastName, email, username, phone, role, password");
  }
  // Kiểm tra trùng lặp thông tin
  const validationErrors = await validateUserData(userData, userId);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lỗi xác thực dữ liệu", validationErrors);
  }

  // Admin có thể cập nhật các trường nhạy cảm hơn như role, status,...
  const { resetPasswordToken, resetPasswordExpires, verificationToken, ...updateData } = userData;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
  );

  if (!updatedUser) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }

  return updatedUser;
};

// Thay đổi mật khẩu
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }

  // Kiểm tra mật khẩu hiện tại
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Mật khẩu hiện tại không đúng");
  }

  // Hash mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { success: true, message: "Mật khẩu đã thay đổi thành công" };
};

// Xóa người dùng
const deleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }
  return { success: true, message: "Xóa người dùng thành công" };
};

// Chặn người dùng
const banUser = async (userId, banInfo) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }
  // Không thể chặn người dùng là admin
  if (user.role === "admin") {
    throw new ApiError(400, "Không thể chặn người dùng có quyền admin");
  }

  // Cập nhật trạng thái người dùng
  user.isBlocked = true;

  // Thêm thông tin về việc chặn nếu có
  if (banInfo && banInfo.reason) {
    user.banReason = banInfo.reason;
  }

  if (banInfo && banInfo.bannedUntil) {
    user.bannedUntil = banInfo.bannedUntil;
  }

  await user.save();

  return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
};

// Bỏ chặn người dùng
const unbanUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Người dùng không tồn tại");
  }
  // Kiểm tra nếu người dùng đang bị chặn
  if (user.isBlocked !== true) {
    throw new ApiError(400, "Người dùng này hiện không bị chặn");
  }

  // Cập nhật trạng thái người dùng
  user.isBlocked = false;
  user.banReason = undefined;
  user.bannedUntil = undefined;

  await user.save();

  return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
};

module.exports = {
  getAllUsers,
  getUserById,
  validateUserData,
  createUserByAdmin,
  updateUser,
  updateUserByAdmin,
  changePassword,
  deleteUser,
  banUser,
  unbanUser,
};
