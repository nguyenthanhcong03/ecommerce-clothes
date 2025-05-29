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
    console.log('API Response:', response.data);
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
      console.log('response update', response);
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
    filters: {
      search: '',
      categories: [],
      minPrice: null,
      maxPrice: null,
      sizes: [],
      colors: [],
      rating: null,
      inStock: false,
      featured: false,
      isActive: true
    },
    sort: {
      sortBy: 'createdAt',
      sortOrder: 'desc'
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
    openProductDetailModal: (state, action) => {
      state.isDetailModalOpen = true;
      state.modalProductId = action.payload;
    },
    closeProductDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.modalProductId = null;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    toggleFilter: (state, action) => {
      const { filterType, value } = action.payload;
      if (state.filters[filterType]) {
        if (Array.isArray(state.filters[filterType])) {
          // Nếu filter là mảng, thêm hoặc xóa giá trị
          if (state.filters[filterType].includes(value)) {
            state.filters[filterType] = state.filters[filterType].filter((item) => item !== value);
          } else {
            state.filters[filterType].push(value);
          }
        } else {
          // Nếu filter không phải mảng, chỉ cần gán giá trị
          state.filters[filterType] = value;
        }
      }
      // Nếu filter không tồn tại, khởi tạo nó
      else {
        state.filters[filterType] = Array.isArray(value) ? [value] : value;
      }
    },

    resetFilters: (state) => {
      state.filters = {
        search: '',
        categories: [],
        minPrice: null,
        maxPrice: null,
        sizes: [],
        colors: [],
        rating: null,
        inStock: false,
        featured: false,
        isActive: true
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
        state.loading = false;
        state.products = action.payload.products || [];
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
      })

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
      })

      // PRODUCT REVIEWS
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.loading = false;
        // Có thể cập nhật đánh giá ở đây nếu cần
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload.data?.reviews || [];
        state.totalReviews = action.payload.data?.totalReviews || 0;
      });
  }
});

export const {
  openProductDetailModal,
  closeProductDetailModal,
  setFilters,
  setPage,
  setLimit,
  setFilter,
  resetFilters
} = productSlice.actions;

export default productSlice.reducer;
