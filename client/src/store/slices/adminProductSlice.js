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
    const response = await getAllProductsAPI(params);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchProductById = createAsyncThunk('product/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await getProductByIdAPI(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await getFeaturedProductsAPI(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createProduct = createAsyncThunk('product/createProduct', async (payload, { rejectWithValue }) => {
  try {
    const response = await createProductAPI(payload);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const updateProductById = createAsyncThunk(
  'product/updateProductById',
  async ({ productId, payload }, { rejectWithValue }) => {
    try {
      const response = await updateProductByIdAPI(productId, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteProductById = createAsyncThunk(
  'product/deleteProductById',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await deleteProductByIdAPI(productId);
      return { ...response.data, id: productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addProductReview = createAsyncThunk(
  'product/addProductReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await addProductReviewAPI(productId, reviewData);
      return { ...response, productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'product/fetchProductReviews',
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getProductReviewsAPI(productId, page, limit);
      return { ...response, productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminProductSlice = createSlice({
  name: 'adminProduct',
  initialState: {
    products: [],
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0
    },
    filters: {
      search: '',
      minPrice: null,
      maxPrice: null,
      sizes: [],
      colors: [],
      rating: null
    },
    sort: {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    loading: false,
    error: null
  },
  reducers: {
    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: null,
        maxPrice: null,
        sizes: [],
        colors: [],
        rating: null,
        inStock: false,
        featured: false
      };
    },

    //admin
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset về trang 1 khi thay đổi số lượng hiển thị
    },
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
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
        console.log('action.payload', action.payload);
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // CREATE PRODUCT
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        console.log('action.payload', action.payload);
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // UPDATE PRODUCT
      .addCase(updateProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);
        state.loading = false;
        const updatedProduct = action.payload.data;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = updatedProduct;
        }
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // DELETE PRODUCT
      .addCase(deleteProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.products = state.products.filter((product) => product._id !== deletedId);
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  }
});

export const { setPage, setLimit, setFilter, resetFilters } = adminProductSlice.actions;

export default adminProductSlice.reducer;
