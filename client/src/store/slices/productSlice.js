import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getAllProductsAPI,
  getFeaturedProductsAPI,
  getProductByIdAPI,
  getProductReviewsAPI
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

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0
    },

    currentProduct: null,
    productReviews: [],
    totalReviews: 0,
    isDetailModalOpen: false,
    modalProductId: null,
    loading: false,
    loadingFetchProductById: false,
    error: null
  },
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setProducts: (state, action) => {},
    openProductDetailModal: (state, action) => {
      state.isDetailModalOpen = true;
      state.modalProductId = action.payload;
    },
    closeProductDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.modalProductId = null;
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
        // 👇 Đây là chỗ "giữ lại state cũ" và gộp thêm sản phẩm mới
        const currentPage = action.meta.arg.page;

        if (currentPage === 1) {
          // Nếu là trang đầu tiên, reset danh sách
          state.products = action.payload.products;
        } else {
          // Nếu không, gộp thêm vào danh sách hiện có
          state.products = [...state.products, ...action.payload.products];
        }
        // state.products = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // GET PRODUCT BY ID
      .addCase(fetchProductById.pending, (state) => {
        state.loadingFetchProductById = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingFetchProductById = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingFetchProductById = false;
        state.error = action.payload?.message || action.error.message;
      });

    // // FEATURED PRODUCTS
    // .addCase(fetchFeaturedProducts.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
    //   state.loading = false;
    //   // Không cập nhật state.products để tránh ảnh hưởng đến trang danh sách sản phẩm chính
    //   // Bạn có thể thêm một thuộc tính riêng nếu cần: state.featuredProducts = action.payload.data;
    // })
    // .addCase(fetchFeaturedProducts.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload?.message || action.error.message;
    // })
  }
});

export const { openProductDetailModal, closeProductDetailModal, setPage } = productSlice.actions;

export default productSlice.reducer;
