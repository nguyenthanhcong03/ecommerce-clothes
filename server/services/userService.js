import User from "../models/user.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";

// Kiá»ƒm tra trÃ¹ng láº·p thÃ´ng tin
const validateUserData = async (userData, userId = null) => {
  const { email, phone } = userData;
  const errors = [];

  // Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i chÆ°a
  if (email) {
    const query = { email: email };
    if (userId) query._id = { $ne: userId };

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      errors.push({ field: "email", message: "Email Ä‘Ã£ tá»“n táº¡i" });
    }
  }

  // Kiá»ƒm tra phone Ä‘Ã£ tá»“n táº¡i chÆ°a
  if (userData.phone) {
    const query = { phone: userData.phone };
    if (userId) query._id = { $ne: userId };

    const existingPhone = await User.findOne(query);
    if (existingPhone) {
      errors.push({ field: "phone", message: "Sá»‘ Ä‘iá»‡n thoáº¡i Ä‘Ã£ tá»“n táº¡i" });
    }
  }

  return errors;
};

// TÃ¬m táº¥t cáº£ ngÆ°á»i dÃ¹ng vá»›i phÃ¢n trang vÃ  lá»c
const getAllUsers = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1 } = options;
  const skip = (page - 1) * limit;

  // XÃ¢y dá»±ng query filters
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

  // Thá»±c hiá»‡n truy váº¥n
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

// Láº¥y má»™t ngÆ°á»i dÃ¹ng theo ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
  );
  if (!user) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }
  return user;
};

// Táº¡o ngÆ°á»i dÃ¹ng má»›i bá»Ÿi Admin
const createUserByAdmin = async (userData) => {
  const { firstName, lastName, email, username, phone, role, password } = userData;
  // Kiá»ƒm tra dá»¯ liá»‡u báº¯t buá»™c
  if (!firstName || !lastName || !email || !phone || !username || !role || !password) {
    throw new ApiError(
      400,
      "Thiáº¿u thÃ´ng tin báº¯t buá»™c: firstName, lastName, email, username, phone, role, password"
    );
  }

  // Kiá»ƒm tra trÃ¹ng láº·p thÃ´ng tin
  const validationErrors = await validateUserData(userData);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lá»—i xÃ¡c thá»±c dá»¯ liá»‡u", validationErrors);
  }

  // Hash máº­t kháº©u
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(password, salt);

  // Máº·c Ä‘á»‹nh tráº¡ng thÃ¡i active náº¿u khÃ´ng Ä‘Æ°á»£c cung cáº¥p
  if (userData.isBlocked === undefined) {
    userData.isBlocked = false;
  }

  // Táº¡o ngÆ°á»i dÃ¹ng má»›i
  const newUser = await User.create(userData);

  // Tráº£ vá» thÃ´ng tin ngÆ°á»i dÃ¹ng mÃ  khÃ´ng cÃ³ máº­t kháº©u
  const userToReturn = newUser.toObject();
  delete userToReturn.password;
  delete userToReturn.resetPasswordToken;
  delete userToReturn.resetPasswordExpires;
  delete userToReturn.verificationToken;

  return userToReturn;
};

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng
const updateUser = async (userId, userData, currentUserId) => {
  // Kiá»ƒm tra trÃ¹ng láº·p thÃ´ng tin
  const validationErrors = await validateUserData(userData, userId);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lá»—i xÃ¡c thá»±c dá»¯ liá»‡u", validationErrors);
  }

  // KhÃ´ng cho phÃ©p cáº­p nháº­t má»™t sá»‘ trÆ°á»ng nháº¡y cáº£m qua phÆ°Æ¡ng thá»©c nÃ y
  const { password, resetPasswordToken, resetPasswordExpires, verificationToken, role, ...updateData } = userData;

  // Chá»‰ admin má»›i cÃ³ thá»ƒ cáº­p nháº­t role
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
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }

  return updatedUser;
};

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng bá»Ÿi Admin (cÃ³ nhiá»u quyá»n háº¡n hÆ¡n)
const updateUserByAdmin = async (userId, userData) => {
  const { firstName, lastName, email, username, phone, role } = userData;
  // Kiá»ƒm tra dá»¯ liá»‡u báº¯t buá»™c
  if (!firstName || !lastName || !email || !phone || !username || !role) {
    throw new ApiError(
      400,
      "Thiáº¿u thÃ´ng tin báº¯t buá»™c: firstName, lastName, email, username, phone, role, password"
    );
  }
  // Kiá»ƒm tra trÃ¹ng láº·p thÃ´ng tin
  const validationErrors = await validateUserData(userData, userId);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Lá»—i xÃ¡c thá»±c dá»¯ liá»‡u", validationErrors);
  }

  // Admin cÃ³ thá»ƒ cáº­p nháº­t cÃ¡c trÆ°á»ng nháº¡y cáº£m hÆ¡n nhÆ° role, status,...
  const { resetPasswordToken, resetPasswordExpires, verificationToken, ...updateData } = userData;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
  );

  if (!updatedUser) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }

  return updatedUser;
};

// Thay Ä‘á»•i máº­t kháº©u
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }

  // Kiá»ƒm tra máº­t kháº©u hiá»‡n táº¡i
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng");
  }

  // Hash máº­t kháº©u má»›i
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { success: true, message: "Máº­t kháº©u Ä‘Ã£ thay Ä‘á»•i thÃ nh cÃ´ng" };
};

// XÃ³a ngÆ°á»i dÃ¹ng
const deleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }
  return { success: true, message: "XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng" };
};

// Cháº·n ngÆ°á»i dÃ¹ng
const banUser = async (userId, banInfo) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }
  // KhÃ´ng thá»ƒ cháº·n ngÆ°á»i dÃ¹ng lÃ  admin
  if (user.role === "admin") {
    throw new ApiError(400, "KhÃ´ng thá»ƒ cháº·n ngÆ°á»i dÃ¹ng cÃ³ quyá»n admin");
  }

  // Cáº­p nháº­t tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng
  user.isBlocked = true;

  // ThÃªm thÃ´ng tin vá» viá»‡c cháº·n náº¿u cÃ³
  if (banInfo && banInfo.reason) {
    user.banReason = banInfo.reason;
  }

  if (banInfo && banInfo.bannedUntil) {
    user.bannedUntil = banInfo.bannedUntil;
  }

  await user.save();

  return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
};

// Bá» cháº·n ngÆ°á»i dÃ¹ng
const unbanUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }
  // Kiá»ƒm tra náº¿u ngÆ°á»i dÃ¹ng Ä‘ang bá»‹ cháº·n
  if (user.isBlocked !== true) {
    throw new ApiError(400, "NgÆ°á»i dÃ¹ng nÃ y hiá»‡n khÃ´ng bá»‹ cháº·n");
  }

  // Cáº­p nháº­t tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng
  user.isBlocked = false;
  user.banReason = undefined;
  user.bannedUntil = undefined;

  await user.save();

  return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
};

export default {
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
