// const User = require("../models/user");
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
// const asyncHandler = require("express-async-handler");
// const cloudinary = require("../config/cloudinary");
// const jwt = require("jsonwebtoken");
// const { createUserService, uploadSingleFile, uploadMultipleFiles } = require("../services/userService");
// const { uploadSingleFile2 } = require("../services/hihiService");
// const { generateAccessToken } = require("../utils/jwt");

// const getCurrentUser = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const user = await User.findById(_id).select("-password -refreshToken -role");
//   return res.status(200).json({ success: true, rs: user ? user : "User not found" });
// });

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   // Lấy token từ cookies
//   const cookie = req.cookies;
//   // Check xem có token hay không
//   if (!cookie && !cookie.refreshToken) {
//     throw new Error("No Refresh token in cookies");
//   }
//   // Check token có hợp lệ hay không
//   const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
//   const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken });
//   return res.status(200).json({
//     success: response ? true : false,
//     newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refresh token not sss",
//   });
// });

// const logout = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie && !cookie.refreshToken) {
//     throw new Error("No Refresh token in cookies");
//   }
//   // Xóa refreshToken trong db
//   await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: "" }, { new: true });
//   // Xóa refreshToken trong cookie
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });
//   return res.status(200).json({
//     success: true,
//     message: "Logout successfully",
//   });
// });

// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.query;
//   if (!email) throw new Error("Missing fields");
//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User not found");
//   const token = await user.createPasswordResetToken();
//   await user.save();
//   const html = `Nhấn vào liên kết dưới đây để thay đổi mật khẩu. Liên kết sẽ hết hạn sau 10 phút <a href=${process.env.SERVER_URL}/api/user/reset-password?token=${token}>Click here</a>`;
//   const data = {
//     to: email,
//     html,
//   };
//   const rs = await sendMail(data);
//   return res.status(200).json({ success: true, rs });
// });

// const getAllUsers = async (req, res) => {
//   try {
//     // 1. Fav lấy các query parameters từ request
//     const {
//       page = 1, // Trang mặc định là 1
//       limit = 10, // Số sản phẩm mỗi trang mặc định là 10
//       sortBy = "createdAt", // Sắp xếp mặc định theo ngày tạo
//       order = "desc", // Thứ tự mặc định giảm dần
//       search, // Từ khóa tìm kiếm
//       role,
//     } = req.query;

//     // 2. Xây dựng query
//     let query = {};

//     // Search theo tên hoặc mô tả
//     if (search) {
//       query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
//     }

//     // Filter theo category
//     if (role) {
//       query.role = role;
//     }

//     // 3. Tính tổng số documents
//     const total = await User.countDocuments(query);
//     console.log("check total", total);

//     // 4. Thực hiện query với pagination và sort
//     const users = await User.find(query)
//       // .populate("categoryId", "name slug") // Liên kết với collection Categories
//       .sort({ [sortBy]: order === "desc" ? -1 : 1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .select("-__v"); // Loại bỏ field version

//     console.log("check users", users);

//     // 5. Tạo response
//     const response = {
//       success: true,
//       data: users,
//       pagination: {
//         current: Number(page),
//         pageSize: Number(limit),
//         total: total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// const createUser = async (req, res) => {
//   const { firstName, lastName, username, address, role, email, phone, password } = req.body;
//   if (!firstName || !lastName || !email || !password || !role) {
//     return res.status(400).json({ success: false, message: "Missing fields" });
//   }
//   try {
//     // Kiểm tra email đã tồn tại
//     const existedUser = await User.findOne({ username });
//     if (existedUser) {
//       return res.status(400).json({ message: "Người dùng đã tồn tại" });
//     }

//     // Mã hóa mật khẩu
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       firstName,
//       lastName,
//       address,
//       phone,
//       role,
//     });

//     res.status(200).json({ success: true, message: "Create user successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// const deleteUser = asyncHandler(async (req, res) => {
//   const { _id } = req.query;
//   if (!_id) throw new Error("Missing input");
//   const response = await User.findByIdAndDelete(_id);
//   return res.status(200).json({
//     success: response ? true : false,
//     deletedUser: response ? `User with email ${response.email} delete` : "No user delete",
//   });
// });

// const updateUser = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   if (!_id || Object.keys(req.body).length === 0) throw new Error("Missing input");
//   const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select("-password -role");
//   return res.status(200).json({
//     success: response ? true : false,
//     data: response ? response : "Something went wrong",
//   });
// });

// const updateUserByAdmin = asyncHandler(async (req, res) => {
//   const { uid } = req.params;
//   if (Object.keys(req.body).length === 0) throw new Error("Missing input");
//   const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select("-password -role");
//   return res.status(200).json({
//     success: response ? true : false,
//     data: response ? response : "Something went wrong",
//   });
// });

// // const uploadImageUser = async (req, res) => {
// //   try {
// //     if (!req.file) {
// //       return res.status(400).json({ message: "Vui lòng chọn file ảnh" });
// //     }

// //     const avatarUrl = req.file.path; // URL từ Cloudinary
// //     res.status(200).json({
// //       message: "Upload avatar thành công",
// //       avatarUrl: avatarUrl,
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "Lỗi server", error: error.message });
// //   }
// // };
// const uploadImage = async (req, res) => {
//   try {
//     console.log("hehe");
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng upload một file ảnh",
//       });
//     }

//     const result = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "uploads",
//           transformation: [{ width: 1000, height: 1000, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );

//       uploadStream.end(req.file.buffer);
//     });

//     res.status(200).json({
//       success: true,
//       message: "Upload ảnh thành công",
//       data: {
//         url: result.secure_url,
//         public_id: result.public_id,
//         format: result.format,
//         width: result.width,
//         height: result.height,
//       },
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi upload ảnh",
//       error: error.message,
//     });
//   }
// };

// const uploadAvatar = async (req, res) => {
//   try {
//     // Kiểm tra xem có file được upload không
//     if (!req.files || !req.files.image) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng upload một file ảnh",
//       });
//     }

//     const file = req.files.image;

//     // Kiểm tra định dạng file
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return res.status(400).json({
//         success: false,
//         message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
//       });
//     }

//     // Gọi service để upload lên Cloudinary
//     const uploadResult = await uploadSingleFile(file);

//     // Trả về kết quả
//     res.status(200).json({
//       success: true,
//       message: "Upload ảnh thành công",
//       data: uploadResult,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi upload ảnh",
//       error: error.message,
//     });
//   }
// };

// const uploadMultipleImages = async (req, res) => {
//   try {
//     console.log(req.files);
//     if (!req.files || !req.files.image) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng upload ít nhất một file ảnh",
//       });
//     }

//     // Chuyển thành mảng nếu chỉ upload 1 file
//     const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

//     // Kiểm tra định dạng tất cả file
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//     const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
//     if (invalidFiles.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
//       });
//     }

//     // Upload nhiều file lên Cloudinary
//     const uploadResults = await uploadMultipleFiles(files);

//     res.status(200).json({
//       success: true,
//       message: "Upload nhiều ảnh thành công",
//       data: uploadResults,
//     });
//   } catch (error) {
//     console.error("Multiple upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi upload nhiều ảnh",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   logout,
//   getCurrentUser,
//   refreshAccessToken,
//   forgotPassword,
//   getAllUsers,
//   deleteUser,
//   updateUser,
//   updateUserByAdmin,
//   createUser,
//   uploadImage,
//   uploadAvatar,
//   uploadMultipleImages,
// };
