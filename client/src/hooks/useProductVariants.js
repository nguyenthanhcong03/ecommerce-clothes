import { useEffect, useMemo, useState } from 'react';

const useProductVariants = (product) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  useEffect(() => {
    // Reset state
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setShowValidation(false);
    setCurrentImageIndex(0);
    setAllImages([]);

    // Khởi tạo mảng hình ảnh khi sản phẩm được tải
    if (product && product.images) {
      // Chỉ sử dụng hình ảnh từ product level
      const productImages = product.images || [];
      setAllImages(productImages);
      setCurrentImageIndex(0);
    }
  }, [product]);
  // Tính toán size và color có sẵn dựa trên các biến thể của sản phẩm
  const variantOptions = useMemo(() => {
    if (!product?.variants) return { sizes: [], colors: [], sizeMap: new Map(), colorMap: new Map() };

    const sizeMap = new Map();
    const colorMap = new Map();

    product.variants.forEach((variant) => {
      // Map size to colors
      if (!sizeMap.has(variant.size)) {
        sizeMap.set(variant.size, new Set());
      }
      sizeMap.get(variant.size).add(variant.color);

      // Map color to sizes
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, new Set());
      }
      colorMap.get(variant.color).add(variant.size);
    });

    return {
      sizes: Array.from(sizeMap.keys()),
      colors: Array.from(colorMap.keys()),
      sizeMap,
      colorMap
    };
  }, [product?.variants]);

  const getAvailableColors = (size) => {
    if (!size) return Array.from(variantOptions.colors || []);

    const availableColors = [];
    const colorsForSize = variantOptions.sizeMap.get(size) || [];

    colorsForSize.forEach((color) => {
      const variant = product?.variants.find((v) => v.size === size && v.color === color);
      if (variant && variant.stock > 0) {
        availableColors.push(color);
      }
    });

    return availableColors;
  };

  const getAvailableSizes = (color) => {
    if (!color) return Array.from(variantOptions.sizes || []);

    const availableSizes = [];
    const sizesForColor = variantOptions.colorMap.get(color) || [];

    sizesForColor.forEach((size) => {
      const variant = product?.variants.find((v) => v.size === size && v.color === color);
      if (variant && variant.stock > 0) {
        availableSizes.push(size);
      }
    });

    return availableSizes;
  };

  const handleSizeSelect = (size) => {
    // Kiểm tra xem size đã được chọn hay chưa
    if (selectedSize === size) {
      setSelectedSize('');
      setQuantity(1);
      setShowValidation(false);
      return;
    }

    // Kiểm tra size có hết hàng không
    if (isSizeOutOfStock(size)) {
      return;
    }

    setSelectedSize(size);
    setQuantity(1);

    // Kiểm tra xem màu hiện tại có khả dụng cho kích thước mới không
    if (selectedColor) {
      const availableColors = getAvailableColors(size);
      if (!availableColors.includes(selectedColor)) {
        setSelectedColor('');
        setQuantity(1);
      }
    }
  };
  const handleColorSelect = (color) => {
    // Kiểm tra xem color đã được chọn hay chưa
    if (selectedColor === color) {
      setSelectedColor('');
      setQuantity(1);
      setShowValidation(false);
      return;
    }

    // Kiểm tra color có hết hàng không
    if (isColorOutOfStock(color)) {
      return;
    }

    setSelectedColor(color);
    setQuantity(1);

    // Kiểm tra xem kích thước hiện tại có khả dụng cho màu mới không
    if (selectedSize) {
      const availableSizes = getAvailableSizes(color);
      if (!availableSizes.includes(selectedSize)) {
        setSelectedSize('');
        setQuantity(1);
      }
    }
  };

  // Kiểm tra xem tất cả variant có hết hàng không
  const isProductOutOfStock = useMemo(() => {
    if (!product?.variants) return false;
    return product.variants.every((variant) => variant.stock === 0);
  }, [product?.variants]);

  // Kiểm tra xem size có hết hàng không (tất cả variant của size đó đều hết hàng)
  const isSizeOutOfStock = (size) => {
    if (!product?.variants || !size) return false;
    const variantsForSize = product.variants.filter((v) => v.size === size);
    return variantsForSize.length > 0 && variantsForSize.every((variant) => variant.stock === 0);
  };

  // Kiểm tra xem color có hết hàng không (tất cả variant của color đó đều hết hàng)
  const isColorOutOfStock = (color) => {
    if (!product?.variants || !color) return false;
    const variantsForColor = product.variants.filter((v) => v.color === color);
    return variantsForColor.length > 0 && variantsForColor.every((variant) => variant.stock === 0);
  };

  // Kiểm tra xem variant cụ thể có hết hàng không
  const isVariantOutOfStock = (size, color) => {
    if (!product?.variants || !size || !color) return false;
    const variant = product.variants.find((v) => v.size === size && v.color === color);
    return !variant || variant.stock === 0;
  };

  // Lấy giá và thông tin variant đã chọn
  const getSelectedPrice = () => {
    if (selectedSize && selectedColor) {
      const selectedVariant = product?.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      if (selectedVariant) {
        return {
          price: selectedVariant?.price,
          originalPrice: selectedVariant?.originalPrice,
          stock: selectedVariant?.stock,
          selectedVariant
        };
      }
    }

    // Nếu không chọn variant nào thì trả về giá nhỏ nhất
    const defaultVariant = product?.variants.reduce((min, variant) =>
      !min || variant.price < min.price ? variant : min
    );

    return {
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice || 0,
      stock: defaultVariant?.stock || 0
    };
  };

  return {
    selectedSize,
    selectedColor,
    quantity,
    showValidation,
    currentImageIndex,
    allImages,
    variantOptions,
    isProductOutOfStock,
    isSizeOutOfStock,
    isColorOutOfStock,
    isVariantOutOfStock,
    setQuantity,
    setShowValidation,
    setCurrentImageIndex,
    setAllImages,
    getAvailableColors,
    getAvailableSizes,
    handleSizeSelect,
    handleColorSelect,
    getSelectedPrice
  };
};

export default useProductVariants;
