const Product = require("../models/product");

const syncCartItemSnapshots = async (cart) => {
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      item.isAvailable = false;
      continue;
    }

    const variant = product.variants.id(item.variantId);
    if (!variant) {
      item.isAvailable = false;
      continue;
    }

    if (variant.stock < item.quantity) {
      item.quantity = variant.stock;
    }

    // Update snapshot
    item.snapshot.name = product.name;
    item.snapshot.price = variant.price;
    item.snapshot.discountPrice = variant.discountPrice || null;
    item.snapshot.image = variant.images?.[0] || product.images?.[0];
    item.snapshot.color = variant.color;
    item.snapshot.size = variant.size;
    item.snapshot.stock = variant.stock;
    item.isAvailable = variant.stock >= item.quantity;
  }

  await cart.save();
};

module.exports = { syncCartItemSnapshots };
