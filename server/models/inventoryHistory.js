const mongoose = require("mongoose");

const inventoryHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["import", "export", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh theo sản phẩm và biến thể
inventoryHistorySchema.index({ productId: 1, variantId: 1 });
// Index để tìm kiếm theo loại giao dịch
inventoryHistorySchema.index({ type: 1 });
// Index để tìm kiếm theo ngày tạo
inventoryHistorySchema.index({ createdAt: 1 });

const InventoryHistory = mongoose.model("InventoryHistory", inventoryHistorySchema);

module.exports = InventoryHistory;
