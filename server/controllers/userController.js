import bcrypt from "bcryptjs";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

// Láº¥y danh sÃ¡ch ngÆ°á»i dÃ¹ng vá»›i phÃ¢n trang vÃ  lá»c
const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, role, isBlocked, search } = req.query;
  const filters = {};
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 5,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder === "asc" ? 1 : -1,
  };

  // Build filters
  if (role) {
    filters.role = role;
  }

  if (isBlocked !== undefined) {
    filters.isBlocked = isBlocked === "true";
  }

  if (search) {
    filters.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (options.page - 1) * options.limit;

  // Build sort object
  const sort = {};
  sort[options.sortBy] = options.sortOrder;

  // Execute query
  const response = await User.find(filters).select("-password").sort(sort).skip(skip).limit(options.limit);

  responseSuccess(res, 200, "Láº¥y danh sÃ¡ch ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", {
    data: response,
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
  });
});

// Láº¥y thÃ´ng tin cá»§a má»™t ngÆ°á»i dÃ¹ng
const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  responseSuccess(res, 200, "Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", user);
});

// Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  responseSuccess(res, 200, "Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", user);
});

// Táº¡o ngÆ°á»i dÃ¹ng má»›i bá»Ÿi Admin
const createUserByAdmin = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone, role = "customer" } = req.body;

  // Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
  }

  // Táº¡o password ngáº«u nhiÃªn náº¿u khÃ´ng cÃ³
  const userPassword = password || Math.random().toString(36).slice(-8);

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

  // Táº¡o user má»›i
  const newUser = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    role,
  });

  // Loáº¡i bá» password khá»i response
  const userResponse = newUser.toObject();
  delete userResponse.password;

  responseSuccess(res, 201, "Táº¡o ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", {
    user: userResponse,
    temporaryPassword: password ? undefined : userPassword, // Chá»‰ tráº£ vá» password táº¡m náº¿u tá»± Ä‘á»™ng táº¡o
  });
});

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng
const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, phone, gender, dateOfBirth, address } = req.body;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // Cáº­p nháº­t thÃ´ng tin
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (address) updateData.address = address;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password"
  );

  responseSuccess(res, 200, "Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", updatedUser);
});

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng bá»Ÿi Admin
const updateUserByAdmin = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { email, firstName, lastName, phone, role, isBlocked, gender, dateOfBirth, address } = req.body;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // Kiá»ƒm tra email náº¿u thay Ä‘á»•i
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) throw new ApiError(400, "Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
  }

  // Cáº­p nháº­t thÃ´ng tin
  const updateData = {};
  if (email) updateData.email = email;
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (address) updateData.address = address;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password"
  );

  responseSuccess(res, 200, "Cáº­p nháº­t ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", updatedUser);
});

// XÃ³a ngÆ°á»i dÃ¹ng (chá»‰ admin má»›i cÃ³ quyá»n)
const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // KhÃ´ng cho phÃ©p admin tá»± xÃ³a chÃ­nh mÃ¬nh
  if (userId === req.user._id.toString()) throw new ApiError(400, "KhÃ´ng thá»ƒ xÃ³a tÃ i khoáº£n cá»§a chÃ­nh mÃ¬nh");

  await User.findByIdAndDelete(userId);

  responseSuccess(res, 200, "XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng");
});

// Thay Ä‘á»•i máº­t kháº©u
const changePassword = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) throw new ApiError(400, "Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng");

  // Hash new password
  const saltRounds = 10;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  responseSuccess(res, 200, "Äá»•i máº­t kháº©u thÃ nh cÃ´ng");
});

// Cháº·n ngÆ°á»i dÃ¹ng
const banUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // KhÃ´ng cho phÃ©p admin tá»± cháº·n chÃ­nh mÃ¬nh
  if (userId === req.user._id.toString())
    throw new ApiError(400, "KhÃ´ng thá»ƒ cháº·n tÃ i khoáº£n cá»§a chÃ­nh mÃ¬nh");

  // Cáº­p nháº­t tráº¡ng thÃ¡i cháº·n
  user.isBlocked = true;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  responseSuccess(res, 200, "Cháº·n ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", userResponse);
});

// Bá» cháº·n ngÆ°á»i dÃ¹ng
const unbanUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");

  // Cáº­p nháº­t tráº¡ng thÃ¡i bá» cháº·n
  user.isBlocked = false;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  responseSuccess(res, 200, "Bá» cháº·n ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng", userResponse);
});

export default {
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
