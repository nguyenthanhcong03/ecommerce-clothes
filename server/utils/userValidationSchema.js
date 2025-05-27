import * as yup from "yup";

// Schema cho form thêm/sửa user bởi admin
export const userAdminSchema = yup.object({
  firstName: yup
    .string()
    .required("Tên là bắt buộc")
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không được quá 50 ký tự"),

  lastName: yup
    .string()
    .required("Họ là bắt buộc")
    .min(2, "Họ phải có ít nhất 2 ký tự")
    .max(50, "Họ không được quá 50 ký tự"),

  email: yup.string().required("Email là bắt buộc").email("Email không hợp lệ"),

  username: yup
    .string()
    .required("Tên đăng nhập là bắt buộc")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(30, "Tên đăng nhập không được quá 30 ký tự")
    .matches(/^[a-zA-Z0-9._-]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang"),

  phone: yup
    .string()
    .nullable()
    .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, "Số điện thoại không hợp lệ")
    .transform((value) => (value === "" ? null : value)),

  role: yup
    .string()
    .required("Vai trò là bắt buộc")
    .oneOf(["admin", "customer"], "Vai trò phải là admin hoặc customer"),

  gender: yup
    .string()
    .nullable()
    .oneOf(["male", "female", "other", null], "Giới tính phải là male, female hoặc other")
    .transform((value) => (value === "" ? null : value)),

  newPassword: yup
    .string()
    .nullable()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .transform((value) => (value === "" ? null : value)),
});

// Schema cho thay đổi mật khẩu
export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required("Mật khẩu hiện tại là bắt buộc").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  newPassword: yup.string().required("Mật khẩu mới là bắt buộc").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([yup.ref("newPassword"), null], "Mật khẩu xác nhận phải khớp với mật khẩu mới"),
});

// Schema cho thêm địa chỉ mới
export const addressSchema = yup.object({
  type: yup
    .string()
    .required("Loại địa chỉ là bắt buộc")
    .oneOf(["home", "work", "billing", "shipping"], "Loại địa chỉ không hợp lệ"),

  street: yup.string().required("Địa chỉ đường là bắt buộc").min(3, "Địa chỉ đường phải có ít nhất 3 ký tự"),

  province: yup.string().required("Thành phố là bắt buộc"),

  district: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  isDefault: yup.boolean().default(false),
});
