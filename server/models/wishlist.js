const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional because user might add to wishlist before selecting variant
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500, // User can add personal notes about the item
    },
  }
  // { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [wishlistItemSchema],
    name: {
      type: String,
      default: "My Wishlist",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize queries by userId and product
wishlistSchema.index({ userId: 1, "items.productId": 1 });

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function (productId) {
  return this.items.some((item) => item.productId.toString() === productId.toString());
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
