import { getProductByIdAPI } from '@/services/productService';
import { useEffect, useState } from 'react';

const useProductDetail = (productId) => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await getProductByIdAPI(productId);
        console.log('response', response);
        setProduct(response.data.product);
      } catch (error) {
        console.log('Failed to fetch product detail:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  return {
    product,
    loading,
    error
  };
};

export default useProductDetail;
