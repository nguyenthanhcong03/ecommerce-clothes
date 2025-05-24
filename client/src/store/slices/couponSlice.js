import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponService from '../../services/couponService';

// Thunk Actions
export const fetchCoupons = createAsyncThunk('coupons/fetchCoupons', async (params, { rejectWithValue }) => {
  try {
    const response = await couponService.getCoupons(params);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể tải danh sách mã giảm giá' });
  }
});

export const fetchActiveCoupons = createAsyncThunk('coupons/fetchActiveCoupons', async (_, { rejectWithValue }) => {
  try {
    const response = await couponService.getActiveCoupons();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể tải danh sách mã giảm giá đang hoạt động' });
  }
});

export const fetchCouponById = createAsyncThunk('coupons/fetchCouponById', async (id, { rejectWithValue }) => {
  try {
    const response = await couponService.getCouponById(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không tìm thấy mã giảm giá' });
  }
});

export const createCoupon = createAsyncThunk('coupons/createCoupon', async (couponData, { rejectWithValue }) => {
  try {
    const response = await couponService.createCoupon(couponData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể tạo mã giảm giá' });
  }
});

export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await couponService.updateCoupon(id, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể cập nhật mã giảm giá' });
    }
  }
);

export const deleteCoupon = createAsyncThunk('coupons/deleteCoupon', async (id, { rejectWithValue }) => {
  try {
    const response = await couponService.deleteCoupon(id);
    return { id, ...response };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể xóa mã giảm giá' });
  }
});

export const toggleCouponStatus = createAsyncThunk(
  'coupons/toggleCouponStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await couponService.toggleCouponStatus(id, isActive);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể thay đổi trạng thái mã giảm giá' });
    }
  }
);

const initialState = {
  coupons: [],
  currentCoupon: null,
  pagination: {
    page: 1,
    limit: 5,
    total: 0
  },
  loading: false,
  error: null,
  success: false,
  message: '',
  filters: {
    code: '',
    isActive: '',
    startDate: '',
    endDate: ''
  }
};

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset về trang 1 khi thay đổi số lượng hiển thị
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCouponState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data.coupons;
        state.pagination = {
          page: action.payload.data.page,
          limit: action.payload.data.limit,
          total: action.payload.data.total
        };
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải danh sách mã giảm giá';
      })

      // Fetch active coupons
      .addCase(fetchActiveCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
      })
      .addCase(fetchActiveCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải danh sách mã giảm giá đang hoạt động';
      })

      // Fetch coupon by ID
      .addCase(fetchCouponById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCoupon = action.payload.data;
      })
      .addCase(fetchCouponById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không tìm thấy mã giảm giá';
      })

      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Thêm mã giảm giá thành công';
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Thêm mã giảm giá thất bại';
      })

      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Cập nhật mã giảm giá thành công';

        // Cập nhật coupon trong danh sách nếu đang hiển thị
        const index = state.coupons.findIndex((coupon) => coupon._id === action.payload.data._id);
        if (index !== -1) {
          state.coupons[index] = action.payload.data;
        }

        // Cập nhật currentCoupon nếu đang xem chi tiết
        if (state.currentCoupon?._id === action.payload.data._id) {
          state.currentCoupon = action.payload.data;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cập nhật mã giảm giá thất bại';
      })

      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Xóa mã giảm giá thành công';

        // Xóa coupon khỏi danh sách
        state.coupons = state.coupons.filter((coupon) => coupon._id !== action.payload.id);
        state.pagination.total -= 1;

        if (state.currentCoupon?._id === action.payload.id) {
          state.currentCoupon = null;
        }
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Xóa mã giảm giá thất bại';
      })

      // Toggle coupon status
      .addCase(toggleCouponStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = `Đã ${action.payload.data.isActive ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá`;

        // Cập nhật trạng thái trong danh sách
        const index = state.coupons.findIndex((coupon) => coupon._id === action.payload.data._id);
        if (index !== -1) {
          state.coupons[index].isActive = action.payload.data.isActive;
        }

        if (state.currentCoupon?._id === action.payload.data._id) {
          state.currentCoupon.isActive = action.payload.data.isActive;
        }
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Thay đổi trạng thái mã giảm giá thất bại';
      });
  }
});

export const { setFilter, resetFilters, setPage, setLimit, clearSuccess, clearError, resetCouponState } =
  couponSlice.actions;

export default couponSlice.reducer;
