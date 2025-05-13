const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Định nghĩa schema cho Category
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Tên danh mục là bắt buộc
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    slug: {
      type: String,
      required: true, // Slug là bắt buộc cho SEO
      unique: true, // Đảm bảo slug là duy nhất, this implicitly creates an index
      lowercase: true, // Chuyển slug thành chữ thường
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category", // Tham chiếu đến chính model Category
      default: null, // Mặc định là null nếu không có danh mục cha
    },
    description: {
      type: String,
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    images: [
      {
        type: String,
      },
    ],
    priority: {
      type: Number,
      default: 0, // Mặc định priority là 0
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Add index for better query performance
categorySchema.index({ parentId: 1 }); // Index on parentId for efficient parent-child queries
categorySchema.index({ priority: -1 }); // Index on priority for sorting categories
categorySchema.index({ isActive: 1 }); // Index on isActive for filtering active categories

// Tạo model từ schema
const Category = mongoose.model("Category", categorySchema);

// Xuất model để sử dụng ở nơi khác
module.exports = Category;
