import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  updateProductByIdAdmin
} from '../../../services/productService.js';

// Định nghĩa async thunk để gọi API
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params) => {
  try {
    const data = await getAllProducts(params);

    console.log('data', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
});

export const handleCreateProduct = createAsyncThunk(
  'products/handleCreateProduct',
  async ({ payload }, { rejectWithValue }) => {
    try {
      const res = await createProduct(payload);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProductById = createAsyncThunk(
  'products/updateProductById',
  async ({ productId, payload }, { rejectWithValue }) => {
    console.log('productId', productId);
    console.log('payload', payload);
    try {
      const res = await updateProductByIdAdmin(productId, payload);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const handleDeleteProductById = createAsyncThunk(
  'products/handleDeleteProductById',
  async ({ productId }, { rejectWithValue }) => {
    console.log('productId', productId);
    try {
      const res = await deleteProductById(productId);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
      // FETCH
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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
        state.error = action.payload || action.error.message;
      })

      // CREATE
      .addCase(handleCreateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleCreateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload.data); // Có thể cần gọi fetch lại tùy backend
      })
      .addCase(handleCreateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // UPDATE
      .addCase(updateProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedProduct = action.payload.data;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // DELETE
      .addCase(handleDeleteProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleDeleteProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload.data?.id || action.meta.arg.productId;
        state.products = state.products.filter((product) => product._id !== deletedId);
      })
      .addCase(handleDeleteProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setIsOpenForm, setSelectedProduct } = productSlice.actions;

export default productSlice.reducer;
