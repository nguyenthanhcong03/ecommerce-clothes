import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllProducts } from '../../../services/productService.js';

// Định nghĩa async thunk để gọi API
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params) => {
  try {
    const data = await getAllProducts(params);
    console.log('check res2', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    total: 0,
    page: 0,
    pages: 1,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isOpenForm: false,
    selectedProduct: null
  },
  reducers: {
    setIsOpenForm: (state, action) => {
      state.isOpenForm = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setIsOpenForm, setSelectedProduct } = productSlice.actions;

export default productSlice.reducer;
