const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class UserService {
  // Tìm tất cả người dùng với phân trang và lọc
  async getAllUsers(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1 } = options;
    const skip = (page - 1) * limit;

    // Xây dựng query filters
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
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
  }

  // Lấy một người dùng theo ID
  async getUserById(userId) {
    return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
  }

  // Tạo người dùng mới bởi Admin
  async createUserByAdmin(userData) {
    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Tạo mật khẩu ngẫu nhiên nếu không được cung cấp
    if (!userData.password) {
      userData.password = crypto.randomBytes(8).toString("hex");
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Mặc định trạng thái active nếu không được cung cấp
    if (!userData.status) {
      userData.status = "active";
    }

    // Tạo người dùng mới
    const newUser = await User.create(userData);

    // Trả về thông tin người dùng mà không có mật khẩu
    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    delete userToReturn.resetPasswordToken;
    delete userToReturn.resetPasswordExpires;
    delete userToReturn.verificationToken;

    return {
      user: userToReturn,
      originalPassword: userData.password ? undefined : userData.password,
    };
  }

  // Cập nhật thông tin người dùng
  async updateUser(userId, userData) {
    // Không cho phép cập nhật một số trường nhạy cảm qua phương thức này
    const { password, resetPasswordToken, resetPasswordExpires, verificationToken, ...updateData } = userData;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
    );

    return updatedUser;
  }

  // Cập nhật thông tin người dùng bởi Admin (có nhiều quyền hạn hơn)
  async updateUserByAdmin(userId, userData) {
    // Admin có thể cập nhật các trường nhạy cảm hơn như role, status,...
    const { password, resetPasswordToken, resetPasswordExpires, verificationToken, ...updateData } = userData;

    // Nếu admin muốn cập nhật mật khẩu
    if (userData.newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(userData.newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  // Thay đổi mật khẩu
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { success: true, message: "Password changed successfully" };
  }

  // Xóa người dùng
  async deleteUser(userId) {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    return { success: true, message: "User deleted successfully" };
  }

  // Thay đổi trạng thái người dùng (active/inactive/banned)
  async changeUserStatus(userId, status) {
    if (!["active", "inactive", "banned"].includes(status)) {
      throw new Error("Invalid status");
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationToken"
    );

    return user;
  }

  // Chặn người dùng
  async banUser(userId, banInfo) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Không thể chặn người dùng là admin
    if (user.role === "admin") {
      throw new Error("Cannot ban an admin user");
    }

    // Cập nhật trạng thái người dùng
    user.status = "banned";

    await user.save();

    return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
  }

  // Bỏ chặn người dùng
  async unbanUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra nếu người dùng đang bị chặn
    if (user.status !== "banned") {
      throw new Error("User is not currently banned");
    }

    // Cập nhật trạng thái người dùng
    user.status = "active";

    await user.save();

    return await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -verificationToken");
  }

  // Thêm địa chỉ mới cho người dùng
  async addUserAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Nếu đây là địa chỉ mặc định, cập nhật các địa chỉ khác
    if (addressData.isDefault) {
      user.address.forEach((addr) => {
        if (addr.type === addressData.type) {
          addr.isDefault = false;
        }
      });
    }

    user.address.push(addressData);
    await user.save();

    return user.address[user.address.length - 1];
  }

  // Cập nhật địa chỉ
  async updateUserAddress(userId, addressId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const addressIndex = user.address.findIndex((addr) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    // Nếu đây là địa chỉ mặc định, cập nhật các địa chỉ khác
    if (addressData.isDefault) {
      user.address.forEach((addr, idx) => {
        if (idx !== addressIndex && addr.type === addressData.type) {
          addr.isDefault = false;
        }
      });
    }

    // Cập nhật địa chỉ
    Object.assign(user.address[addressIndex], addressData);
    await user.save();

    return user.address[addressIndex];
  }

  // Xóa địa chỉ
  async deleteUserAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const addressIndex = user.address.findIndex((addr) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    user.address.splice(addressIndex, 1);
    await user.save();

    return { success: true, message: "Address deleted successfully" };
  }

  // Cập nhật preferences
  async updateUserPreferences(userId, preferencesData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Cập nhật preferences
    Object.assign(user.preferences, preferencesData);
    await user.save();

    return user.preferences;
  }
}

module.exports = new UserService();
