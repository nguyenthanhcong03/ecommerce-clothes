const userService = require("../services/userService");
const User = require("../models/user");
class UserController {
  // Lấy danh sách người dùng với phân trang và lọc
  async getAllUsers(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Lấy thông tin của một người dùng
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Lấy thông tin người dùng hiện tại
  async getCurrentUser(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Tạo người dùng mới bởi Admin
  async createUserByAdmin(req, res) {
    try {
      // Chỉ admin mới có quyền tạo người dùng
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const result = await userService.createUserByAdmin(req.body);

      // Trả về kết quả với mật khẩu gốc nếu đã được tạo ngẫu nhiên
      res.status(201).json({
        success: true,
        data: result.user,
        originalPassword: result.originalPassword,
        message: "User created successfully",
      });
    } catch (error) {
      if (error.message === "Email already exists" || error.message === "Username already exists") {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(req, res) {
    const { username, email, phone, ...rest } = req.body;
    try {
      const userId = req.params.id;
      // Kiểm tra quyền: admin có thể cập nhật bất kỳ user nào, user thường chỉ có thể cập nhật chính mình
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const errors = [];

      // Kiểm tra username đã tồn tại ở user khác
      if (username) {
        const existing = await User.findOne({ username, _id: { $ne: userId } });
        if (existing) {
          errors.push({ field: "username", message: "Username đã tồn tại" });
        }
      }

      // Kiểm tra email đã tồn tại ở user khác
      if (email) {
        const existing = await User.findOne({ email, _id: { $ne: userId } });
        if (existing) {
          errors.push({ field: "email", message: "Email đã tồn tại" });
        }
      }

      // Kiểm tra phone đã tồn tại ở user khác
      if (phone) {
        const existing = await User.findOne({ phone, _id: { $ne: userId } });
        if (existing) {
          errors.push({ field: "phone", message: "Số điện thoại đã tồn tại" });
        }
      }

      // Nếu có lỗi, trả về 400 và danh sách lỗi
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const updatedUser = await userService.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật thông tin người dùng bởi Admin
  async updateUserByAdmin(req, res) {
    try {
      // Chỉ admin mới có quyền sử dụng API này
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const userId = req.params.id;
      const updatedUser = await userService.updateUserByAdmin(userId, req.body);

      res.status(200).json({ success: true, data: updatedUser, message: "User updated successfully" });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ success: false, message: error.message });
      }

      // Handle specific validation errors
      if (
        error.message === "Username already exists" ||
        error.message === "Email already exists" ||
        error.message === "Phone number already exists"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }

      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Xóa người dùng (chỉ admin mới có quyền)
  async deleteUser(req, res) {
    try {
      // Kiểm tra quyền: chỉ admin mới có thể xóa user
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const result = await userService.deleteUser(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Thay đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Người dùng chỉ có thể thay đổi mật khẩu của chính mình
      const userId = req.user.id;

      const result = await userService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === "Current password is incorrect") {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Chặn người dùng
  async banUser(req, res) {
    try {
      // Kiểm tra quyền: chỉ admin mới có thể chặn người dùng
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const userId = req.params.id;
      const banInfo = req.body; // Có thể chứa lý do chặn

      const user = await userService.banUser(userId, banInfo);

      res.status(200).json({
        success: true,
        data: user,
        message: "User has been banned successfully",
      });
    } catch (error) {
      if (error.message === "User not found" || error.message === "Cannot ban an admin user") {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Bỏ chặn người dùng
  async unbanUser(req, res) {
    try {
      // Kiểm tra quyền: chỉ admin mới có thể bỏ chặn người dùng
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const userId = req.params.id;

      const user = await userService.unbanUser(userId);

      res.status(200).json({
        success: true,
        data: user,
        message: "User has been unbanned successfully",
      });
    } catch (error) {
      if (error.message === "User not found" || error.message === "User is not currently banned") {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // === Quản lý địa chỉ ===

  // Thêm địa chỉ mới
  async addUserAddress(req, res) {
    try {
      // Người dùng chỉ có thể thêm địa chỉ cho chính mình hoặc admin có thể thêm cho bất kỳ ai
      const userId = req.params.id || req.user.id;
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const address = await userService.addUserAddress(userId, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật địa chỉ
  async updateUserAddress(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const addressId = req.params.addressId;

      // Kiểm tra quyền
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const address = await userService.updateUserAddress(userId, addressId, req.body);
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      if (error.message === "User not found" || error.message === "Address not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Xóa địa chỉ
  async deleteUserAddress(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const addressId = req.params.addressId;

      // Kiểm tra quyền
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const result = await userService.deleteUserAddress(userId, addressId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found" || error.message === "Address not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật preferences
  async updateUserPreferences(req, res) {
    try {
      const userId = req.params.id || req.user.id;

      // Kiểm tra quyền
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      const preferences = await userService.updateUserPreferences(userId, req.body);
      res.status(200).json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
