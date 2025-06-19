import {
  createReviewAPI,
  getProductReviewsAPI,
  getReviewableProductsAPI,
  getUserReviewsAPI
} from '@/services/reviewService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Định nghĩa async thunk để gọi API
export const createReview = createAsyncThunk('review/createReview', async (reviewData, { rejectWithValue }) => {
  try {
    const response = await createReviewAPI(reviewData);
    return response;
  } catch (error) {
    console.error('API error:', error);
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const getUserReviews = createAsyncThunk('review/getUserReviews', async (options, { rejectWithValue }) => {
  try {
    const response = await getUserReviewsAPI(options);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const getProductReviews = createAsyncThunk(
  'review/getProductReviews',
  async ({ productId, params }, { rejectWithValue }) => {
    try {
      const response = await getProductReviewsAPI(productId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getReviewableProducts = createAsyncThunk(
  'review/getReviewableProducts',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getReviewableProductsAPI(orderId);
      console.log('getProductReviews response:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    // Danh sách đánh giá của sản phẩm hiện tại (dùng cho thống kê)
    productReviews: [],
    // Danh sách đánh giá đã được lọc (dùng cho hiển thị)
    productReviewsByStar: [],
    // Danh sách đánh giá của người dùng
    userReviews: [],
    // Danh sách sản phẩm có thể đánh giá
    reviewableProducts: [],
    // Phân trang
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    // Trạng thái
    loading: false,
    submitting: false,
    error: null,
    success: false
  },
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset về trang 1 khi thay đổi số lượng hiển thị
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // CREATE REVIEW
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = true;
        // Thêm review mới vào danh sách nếu đang ở trang chi tiết sản phẩm
        const newReview = action.payload.data;
        // Cập nhật danh sách reviewable products nếu đang ở trang order detail
        if (state.reviewableProducts.length > 0) {
          state.reviewableProducts = state.reviewableProducts.filter(
            (product) => product.productId !== newReview.productId
          );
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || action.error.message;
        state.success = false;
      })

      // GET USER REVIEWS
      .addCase(getUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload.data.reviews;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // GET PRODUCT REVIEWS
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        // Nếu không có filter (rating=undefined), cập nhật cả hai state
        if (!action.meta.arg.params?.rating) {
          state.productReviews = action.payload.data.reviews;
        }
        // Luôn cập nhật productReviewsByStar cho hiển thị
        state.productReviewsByStar = action.payload.data.reviews;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // GET REVIEWABLE PRODUCTS
      .addCase(getReviewableProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewableProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewableProducts = action.payload.data;
      })
      .addCase(getReviewableProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  }
});

export const { setPage, setLimit, resetSuccess, resetError } = reviewSlice.actions;

export default reviewSlice.reducer;
