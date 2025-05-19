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

const initialState = {
  products: [],
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    size: [],
    color: [],
    rating: null,
    tags: [],
    inStock: false,
    featured: false,
    isActive: true
  },
  sort: {
    sortType: 'latest',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  currentProduct: null,
  productReviews: [],
  totalReviews: 0,
  isDetailModalOpen: false,
  modalProductId: null,
  loading: false,
  error: null
};

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
    console.log('response', response);
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
  initialState: initialState,
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

    toggleFilterValue: (state, action) => {
      const { name, value } = action.payload;

      // Handle array fields like brand, size, color
      if (Array.isArray(state.filters[name])) {
        const index = state.filters[name].indexOf(value);

        if (index !== -1) {
          // Remove value if it already exists
          state.filters[name].splice(index, 1);
        } else {
          // Add value if it doesn't exist
          state.filters[name].push(value);
        }
      }
      // Handle boolean fields like inStock, featured
      else if (typeof state.filters[name] === 'boolean') {
        state.filters[name] = !state.filters[name];
      }

      // Reset to page 1 when filter changes
      state.pagination.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: null,
        brand: [],
        minPrice: null,
        maxPrice: null,
        size: [],
        color: [],
        rating: null,
        tags: [],
        inStock: false,
        featured: false,
        isActive: true // Keep default to showing only active products
      };
      state.pagination.currentPage = 1;
    },

    // Sorting actions
    setSortType: (state, action) => {
      const sortType = action.payload;
      state.sort.sortType = sortType;

      // Update sortBy and order based on sortType
      switch (sortType) {
        case 'latest':
          state.sort.sortBy = 'createdAt';
          state.sort.order = 'desc';
          break;
        case 'popular':
          state.sort.sortBy = 'viewCount';
          state.sort.order = 'desc';
          break;
        case 'top_sales':
          state.sort.sortBy = 'salesCount';
          state.sort.order = 'desc';
          break;
        case 'price_asc':
          state.sort.sortBy = 'price';
          state.sort.order = 'asc';
          break;
        case 'price_desc':
          state.sort.sortBy = 'price';
          state.sort.order = 'desc';
          break;
        case 'rating':
          state.sort.sortBy = 'averageRating';
          state.sort.order = 'desc';
          break;
        default:
          // Handle default or custom sort types
          if (sortType.includes('_')) {
            const [field, direction] = sortType.split('_');
            state.sort.sortBy = field;
            state.sort.order = direction === 'asc' ? 'asc' : 'desc';
          }
      }
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

        // Lưu các filter đã áp dụng (nếu có)
        if (action.payload.filters) {
          // Chỉ cập nhật các filter đã được sử dụng trong API
          const apiFilters = action.payload.filters;

          // Chuyển đổi giá trị string từ API sang kiểu dữ liệu phù hợp
          if (apiFilters.search) state.filters.search = apiFilters.search;
          if (apiFilters.category) state.filters.category = apiFilters.category;

          if (apiFilters.size) {
            state.filters.size = apiFilters.size.includes(',') ? apiFilters.size.split(',') : [apiFilters.size];
          }

          if (apiFilters.color) {
            state.filters.color = apiFilters.color.includes(',') ? apiFilters.color.split(',') : [apiFilters.color];
          }

          if (apiFilters.tags) {
            state.filters.tags = apiFilters.tags.includes(',') ? apiFilters.tags.split(',') : [apiFilters.tags];
          }

          if (apiFilters.minPrice) state.filters.minPrice = parseFloat(apiFilters.minPrice);
          if (apiFilters.maxPrice) state.filters.maxPrice = parseFloat(apiFilters.maxPrice);
          if (apiFilters.rating) state.filters.rating = parseFloat(apiFilters.rating);
          if (apiFilters.featured !== null) state.filters.featured = apiFilters.featured === 'true';
          if (apiFilters.inStock !== null) state.filters.inStock = apiFilters.inStock === 'true';
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // GET PRODUCT BY ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // FEATURED PRODUCTS
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Không cập nhật state.products để tránh ảnh hưởng đến trang danh sách sản phẩm chính
        // Bạn có thể thêm một thuộc tính riêng nếu cần: state.featuredProducts = action.payload.data;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
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
        state.products.unshift(action.payload.data);
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
  toggleFilterValue,
  clearFilters,
  setSortType
} = productSlice.actions;

export default productSlice.reducer;
