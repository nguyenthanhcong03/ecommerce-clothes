import { addReplyToReviewAPI, getProductReviewsAPI } from '@/services/reviewService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Định nghĩa async thunk để gọi API
export const getProductReviews = createAsyncThunk(
  'adminReview/getProductReviews',
  async ({ productId, params }, { rejectWithValue }) => {
    try {
      const response = await getProductReviewsAPI(productId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addReplyToReview = createAsyncThunk(
  'adminReview/addReplyToReview',
  async ({ reviewId, reply }, { rejectWithValue }) => {
    try {
      const response = await addReplyToReviewAPI(reviewId, reply);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice cho admin quản lý đánh giá
const adminReviewSlice = createSlice({
  name: 'adminReview',
  initialState: {
    // Danh sách đánh giá
    reviews: [],
    // Phân trang
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    // Bộ lọc
    filters: {
      rating: null,
      hasReply: null,
      dateRange: null
    },
    // Sắp xếp
    sort: {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    // Trạng thái
    loading: false,
    submitting: false,
    error: null,
    success: false,
    currentReviewId: null
  },
  reducers: {
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
      state.pagination.page = 1; // Reset về trang 1 khi thay đổi bộ lọc
    },
    resetFilter: (state) => {
      state.filters = {
        rating: null,
        hasReply: null,
        dateRange: null
      };
      state.pagination.page = 1;
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sort = {
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };
    },
    setCurrentReviewId: (state, action) => {
      state.currentReviewId = action.payload;
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
      // GET PRODUCT REVIEWS
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data.reviews;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // ADD REPLY TO REVIEW
      .addCase(addReplyToReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addReplyToReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = true;

        // Cập nhật đánh giá trong danh sách
        const updatedReview = action.payload.data;
        state.reviews = state.reviews.map((review) => (review._id === updatedReview._id ? updatedReview : review));

        state.currentReviewId = null;
      })
      .addCase(addReplyToReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || action.error.message;
        state.success = false;
      });
  }
});

export const { setPage, setLimit, setFilter, resetFilter, setSort, setCurrentReviewId, resetSuccess, resetError } =
  adminReviewSlice.actions;

export default adminReviewSlice.reducer;
