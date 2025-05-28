import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addProductReviewAPI,
  createProductAPI,
  deleteProductByIdAPI,
  getAllProductsAPI,
  getFeaturedProductsAPI,
  getProductByIdAPI,
  getProductReviewsAPI,
  updateProductByIdAPI
} from '../../services/productService';

// Định nghĩa async thunk để gọi API
export const fetchProducts = createAsyncThunk('product/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      size = '',
      color = '',
      rating = ''
    } = params;
    console.log('params', params);

    // const queryParams = new URLSearchParams({
    //   page: page.toString(),
    //   limit: limit.toString(),
    //   ...(search && { search }),
    //   ...(category && { category }),
    //   ...(minPrice && { minPrice }),
    //   ...(maxPrice && { maxPrice }),
    //   ...(sortBy && { sortBy }),
    //   ...(sortOrder && { sortOrder }),
    //   ...(size && { size }),
    //   ...(color && { color }),
    //   ...(rating && { rating })
    // });
    const response = await getAllProductsAPI(params);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

const shopSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    loading: false,
    error: null,
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000000 }
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setBrands: (state, action) => {
      state.brands = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL PRODUCTS
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      });
  }
});

export const { clearProducts, setCategories, setBrands, setPriceRange } = shopSlice.actions;

export default shopSlice.reducer;
