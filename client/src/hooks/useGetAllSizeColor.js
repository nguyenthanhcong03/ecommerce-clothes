import { getAllProductsAPI } from '@/services/productService';
import { useEffect, useState, useMemo } from 'react';

export const useGetAllSizeColor = () => {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      const response = await getAllProductsAPI();
      setAllProducts(response.data.products || []);
    };
    fetchAllProducts();
  }, []);

  const allColors = useMemo(() => {
    const colorSet = new Set();
    allProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.color) {
          colorSet.add(variant.color);
        }
      });
    });
    return Array.from(colorSet).sort((a, b) => a.localeCompare(b)); // Trả về mảng color đã sắp xếp
  }, [allProducts]);

  const allSizes = useMemo(() => {
    const sizeSet = new Set();
    allProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.size) {
          sizeSet.add(variant.size);
        }
      });
    });

    // Sắp xếp kích thước theo thứ tự hợp lý
    return Array.from(sizeSet).sort((a, b) => {
      // Nếu size là số
      if (!isNaN(a) && !isNaN(b)) {
        return parseInt(a) - parseInt(b);
      }
      // Mặc định
      return a.localeCompare(b);
    });
  }, [allProducts]);

  return {
    allProducts,
    allColors,
    allSizes
  };
};
