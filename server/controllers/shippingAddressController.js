const User = require("../models/user");
const userService = require("../services/userService");

class ShippingAddressController {
  // Lấy tất cả địa chỉ giao hàng của người dùng
  async getShippingAddresses(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).select("address");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Lọc địa chỉ có loại 'shipping'
      const shippingAddresses = user.address.filter((addr) => addr.type === "shipping");

      res.status(200).json({
        success: true,
        data: shippingAddresses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Thêm địa chỉ giao hàng mới
  async addShippingAddress(req, res) {
    try {
      const userId = req.user._id;
      const addressData = {
        ...req.body,
        type: "shipping", // Đảm bảo loại địa chỉ là 'shipping'
      };

      // Xác thực dữ liệu địa chỉ
      if (
        !addressData.fullName ||
        !addressData.phoneNumber ||
        !addressData.address ||
        !addressData.ward ||
        !addressData.district ||
        !addressData.province
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required address fields",
        });
      }

      const address = await userService.addUserAddress(userId, addressData);

      res.status(201).json({
        success: true,
        data: address,
        message: "Shipping address added successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật địa chỉ giao hàng
  async updateShippingAddress(req, res) {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;
      const addressData = {
        ...req.body,
        type: "shipping", // Đảm bảo loại địa chỉ là 'shipping'
      };

      // Xác thực dữ liệu địa chỉ
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No data provided for update",
        });
      }

      const address = await userService.updateUserAddress(userId, addressId, addressData);

      res.status(200).json({
        success: true,
        data: address,
        message: "Shipping address updated successfully",
      });
    } catch (error) {
      if (error.message === "User not found" || error.message === "Address not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa địa chỉ giao hàng
  async deleteShippingAddress(req, res) {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;

      await userService.deleteUserAddress(userId, addressId);

      res.status(200).json({
        success: true,
        message: "Shipping address deleted successfully",
      });
    } catch (error) {
      if (error.message === "User not found" || error.message === "Address not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Đặt một địa chỉ giao hàng là mặc định
  async setDefaultShippingAddress(req, res) {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Tìm địa chỉ và đảm bảo nó là địa chỉ giao hàng
      const addressIndex = user.address.findIndex(
        (addr) => addr._id.toString() === addressId && addr.type === "shipping"
      );

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Shipping address not found",
        });
      }

      // Đặt tất cả địa chỉ giao hàng khác thành không phải mặc định
      user.address.forEach((addr, idx) => {
        if (addr.type === "shipping") {
          addr.isDefault = idx === addressIndex;
        }
      });

      await user.save();

      res.status(200).json({
        success: true,
        data: user.address[addressIndex],
        message: "Default shipping address set successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ShippingAddressController();
