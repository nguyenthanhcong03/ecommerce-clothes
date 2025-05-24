import { useEffect, useMemo, useState } from 'react';

const useProductVariants = (product) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [colorImageIndexMap, setColorImageIndexMap] = useState({});

  useEffect(() => {
    // Khởi tạo mảng hình ảnh khi sản phẩm được tải
    if (product) {
      // Tạo mảng chứa tất cả hình ảnh từ product và variants
      const productImages = product.images || [];
      const variantImages = [];
      const indexMap = {};

      // Thêm tất cả hình ảnh từ variants vào mảng
      if (product.variants) {
        product.variants.forEach((variant) => {
          if (variant.images && variant.images.length > 0) {
            // Lưu vị trí bắt đầu của hình ảnh variant trong mảng allImages
            indexMap[variant.color] = productImages.length + variantImages.length;
            variant.images.forEach((img) => {
              // Chỉ thêm hình ảnh nếu nó không trùng lặp
              // if (!productImages.includes(img) && !variantImages.includes(img)) {
              variantImages.push(img);
              // }
            });
          }
        });
      }

      // Kết hợp hình ảnh sản phẩm và variant
      const combined = [...productImages, ...variantImages];
      setAllImages(combined);
      setColorImageIndexMap(indexMap);
      console.log('ahha', indexMap);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Tính toán size và color có sẵn dựa trên các biến thể của sản phẩm
  const variantOptions = useMemo(() => {
    if (!product?.variants)
      return { sizes: [], colors: [], sizeMap: new Map(), colorMap: new Map(), colorImageMap: new Map() };

    const sizeMap = new Map();
    const colorMap = new Map();
    const colorImageMap = new Map();

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

      // Map color to images
      if (variant.images && variant.images.length > 0) {
        colorImageMap.set(variant.color, variant.images);
      }
    });
    console.log('colorMap', colorMap);

    return {
      sizes: Array.from(sizeMap.keys()),
      colors: Array.from(colorMap.keys()),
      sizeMap,
      colorMap,
      colorImageMap
    };
  }, [product?.variants]);

  const getAvailableColors = (size) => {
    return Array.from(variantOptions.sizeMap.get(size) || []);
  };

  const getAvailableSizes = (color) => {
    return Array.from(variantOptions.colorMap.get(color) || []);
  };

  const handleSizeSelect = (size) => {
    // Kiểm tra xem size đã được chọn hay chưa
    if (selectedSize === size) {
      setSelectedSize('');
      setQuantity(1);
      setShowValidation(false);
      return;
    }

    setSelectedSize(size);
    setQuantity(1);

    // Kiểm tra xem màu hiện tại có khả dụng cho kích thước mới không, nếu không đặt lại màu
    if (selectedColor && !variantOptions.sizeMap.get(size)?.has(selectedColor)) {
      setSelectedColor('');
      setQuantity(1);
    }
  };

  const handleColorSelect = (color) => {
    // Kiểm tra xem color đã được chọn hay chưa
    if (selectedColor === color) {
      setSelectedColor('');
      setQuantity(1);
      setShowValidation(false);
      setCurrentImageIndex(0); // Reset về ảnh chính đầu tiên khi bỏ chọn màu
      return;
    }

    setSelectedColor(color);
    setQuantity(1);

    // Hiển thị hình ảnh của màu được chọn bằng cách cập nhật currentImageIndex
    if (colorImageIndexMap[color] !== undefined) {
      setCurrentImageIndex(colorImageIndexMap[color]);
    }

    // Kiểm tra xem kích thước hiện tại có khả dụng cho màu mới không, nếu không đặt lại kích thước
    if (selectedSize && !variantOptions.colorMap.get(color)?.has(selectedSize)) {
      setSelectedSize('');
      setQuantity(1);
    }
  };

  const getSelectedPrice = () => {
    if (selectedSize && selectedColor) {
      const selectedVariant = product?.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      if (selectedVariant) {
        return {
          price: selectedVariant?.price,
          discountPrice: selectedVariant?.discountPrice,
          stock: selectedVariant?.stock,
          selectedVariant
        };
      }
    }

    const defaultVariant = product?.variants.reduce((min, variant) =>
      !min || variant.price < min.price ? variant : min
    );

    return {
      price: defaultVariant?.price || 0,
      discountPrice: defaultVariant?.discountPrice || 0,
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
    colorImageIndexMap,
    variantOptions,
    setQuantity,
    setShowValidation,
    setCurrentImageIndex,
    setAllImages,
    setColorImageIndexMap,
    getAvailableColors,
    getAvailableSizes,
    handleSizeSelect,
    handleColorSelect,
    getSelectedPrice
  };
};

export default useProductVariants;
