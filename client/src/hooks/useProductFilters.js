import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters
  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      search: params.search || '',
      category: params.category || '',
      brand: params.brand || '',
      minPrice: params.minPrice ? Number(params.minPrice) : null,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
      size: params.size ? params.size.split(',') : [],
      color: params.color ? params.color.split(',') : [],
      rating: params.rating ? Number(params.rating) : null,
      inStock: params.inStock === 'true',
      sortBy: params.sortBy || 'newest',
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 12
    };
  }, [searchParams]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters) => {
      const updatedParams = { ...filters, ...newFilters };

      // Remove empty values
      Object.keys(updatedParams).forEach((key) => {
        if (
          updatedParams[key] === '' ||
          updatedParams[key] === null ||
          updatedParams[key] === undefined ||
          (Array.isArray(updatedParams[key]) && updatedParams[key].length === 0)
        ) {
          delete updatedParams[key];
        }
      });

      // Convert arrays to comma-separated strings
      if (updatedParams.size && Array.isArray(updatedParams.size)) {
        updatedParams.size = updatedParams.size.join(',');
      }
      if (updatedParams.color && Array.isArray(updatedParams.color)) {
        updatedParams.color = updatedParams.color.join(',');
      }

      // Reset page when filters change (except when explicitly changing page)
      if (!newFilters.hasOwnProperty('page')) {
        updatedParams.page = 1;
      }

      setSearchParams(updatedParams);
    },
    [filters, setSearchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    navigate('/products', { replace: true });
  }, [navigate]);

  return {
    filters,
    updateFilters,
    clearFilters
  };
};
