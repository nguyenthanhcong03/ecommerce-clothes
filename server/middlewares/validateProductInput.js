const validateProductInput = (req, res, next) => {
  const { name, description, categoryId, brand, variants, images } = req.body;

  if (!name || !description || !categoryId || !brand || !variants || !images) {
    return res.status(400).json({
      success: false,
      message: "Thiếu các trường bắt buộc",
    });
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cần ít nhất một biến thể sản phẩm",
    });
  }

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cần ít nhất một ảnh sản phẩm",
    });
  }

  next();
};

module.exports = { validateProductInput };
