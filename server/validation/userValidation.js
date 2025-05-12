const Joi = require("joi");

// Address validation schema
const addressSchema = Joi.object({
  type: Joi.string().valid("home", "work", "billing", "shipping").required().messages({
    "any.required": "Loại địa chỉ là bắt buộc",
    "string.empty": "Loại địa chỉ không được để trống",
    "any.only": "Loại địa chỉ phải là một trong các giá trị: home, work, billing, shipping",
  }),
  street: Joi.string().required().messages({
    "any.required": "Địa chỉ đường phố là bắt buộc",
    "string.empty": "Địa chỉ đường phố không được để trống",
  }),
  province: Joi.string().required().messages({
    "any.required": "Thành phố là bắt buộc",
    "string.empty": "Thành phố không được để trống",
  }),
  district: Joi.string().allow(""),
  isDefault: Joi.boolean().default(false),
});

// Preference validation schema
const preferencesSchema = Joi.object({
  language: Joi.string().default("en"),
  notifications: Joi.boolean().default(true),
});

// User registration validation
const registerSchema = Joi.object({
  email: Joi.string().required().email().lowercase().trim().messages({
    "string.email": "Vui lòng nhập địa chỉ email hợp lệ",
    "any.required": "Email là bắt buộc",
    "string.empty": "Email không được để trống",
  }),

  password: Joi.string().required().min(6).trim().messages({
    "any.required": "Mật khẩu là bắt buộc",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "string.empty": "Mật khẩu không được để trống",
  }),

  username: Joi.string().required().min(3).trim().messages({
    "any.required": "Tên đăng nhập là bắt buộc",
    "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự",
    "string.empty": "Tên đăng nhập không được để trống",
  }),

  firstName: Joi.string().required().trim().messages({
    "any.required": "Tên là bắt buộc",
    "string.empty": "Tên không được để trống",
  }),

  lastName: Joi.string().required().trim().messages({
    "any.required": "Họ là bắt buộc",
    "string.empty": "Họ không được để trống",
  }),
  phone: Joi.string()
    .allow(null, "")
    .pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)
    .messages({
      "string.pattern.base": "Vui lòng nhập số điện thoại hợp lệ",
    }),

  avatar: Joi.string().allow(null, ""),
  gender: Joi.string().valid("male", "female", "other", null),
  dateOfBirth: Joi.string().allow(null, ""),
  address: Joi.array().items(addressSchema),
  preferences: preferencesSchema,
});

// User update validation
const updateSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().messages({
    "string.email": "Vui lòng nhập địa chỉ email hợp lệ",
  }),

  username: Joi.string().min(3).trim().messages({
    "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự",
  }),

  firstName: Joi.string().trim(),

  lastName: Joi.string().trim(),
  phone: Joi.string()
    .allow(null, "")
    .pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)
    .messages({
      "string.pattern.base": "Vui lòng nhập số điện thoại hợp lệ",
    }),

  avatar: Joi.string().allow(null, ""),
  gender: Joi.string().valid("male", "female", "other", null),
  dateOfBirth: Joi.string().allow(null, ""),
  address: Joi.array().items(addressSchema),
  preferences: preferencesSchema,

  // Admin can update these fields
  role: Joi.string().valid("customer", "admin"),
  status: Joi.string().valid("active", "inactive", "banned"),
});

// Password update validation
const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Mật khẩu hiện tại là bắt buộc",
    "string.empty": "Mật khẩu hiện tại không được để trống",
  }),
  newPassword: Joi.string().required().min(6).messages({
    "any.required": "Mật khẩu mới là bắt buộc",
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "string.empty": "Mật khẩu mới không được để trống",
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")).messages({
    "any.required": "Xác nhận mật khẩu là bắt buộc",
    "any.only": "Mật khẩu xác nhận không khớp",
    "string.empty": "Xác nhận mật khẩu không được để trống",
  }),
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.email": "Vui lòng nhập địa chỉ email hợp lệ",
    "any.required": "Email là bắt buộc",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
    "string.empty": "Mật khẩu không được để trống",
  }),
});

// ID validation
const idSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "any.required": "ID là bắt buộc",
      "string.empty": "ID không được để trống",
      "string.pattern.base": "Định dạng ID không hợp lệ",
    }),
});

module.exports = {
  registerSchema,
  updateSchema,
  loginSchema,
  passwordUpdateSchema,
  idSchema,
};
