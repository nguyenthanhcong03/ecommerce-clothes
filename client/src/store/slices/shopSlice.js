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
    console.log('Fetching products with params:', params);
    const response = await getAllProductsAPI(params);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    products: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    loading: false,
    error: null
  },
  reducers: {},
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

export default shopSlice.reducer;
