import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserOrdersAPI, getOrderByIdAPI, cancelOrderAPI, reviewOrderAPI } from '@/services/orderService';
import { toast } from 'react-toastify';

const initialState = {
  orders: [],
  orderDetail: null,
  loading: false,
  error: null,
  totalOrders: 0,
  totalPages: 1,
  currentPage: 1,
  activeTab: 'all' // 'all', 'pending', 'processing', 'shipping', 'delivered', 'cancelled'
};

// Lấy tất cả đơn hàng của người dùng
export const fetchUserOrders = createAsyncThunk(
  'userOrder/fetchUserOrders',
  async ({ page = 1, limit = 5, status = '' }, { rejectWithValue }) => {
    try {
      const response = await getUserOrdersAPI({ page, limit, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Có lỗi xảy ra khi tải đơn hàng');
    }
  }
);

// Lấy chi tiết đơn hàng
export const fetchOrderDetail = createAsyncThunk('userOrder/fetchOrderDetail', async (orderId, { rejectWithValue }) => {
  try {
    const response = await getOrderByIdAPI(orderId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Có lỗi xảy ra khi tải chi tiết đơn hàng');
  }
});

// Hủy đơn hàng
export const cancelOrder = createAsyncThunk(
  'userOrder/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await cancelOrderAPI(orderId, reason);
      return { ...response.data, orderId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Có lỗi xảy ra khi hủy đơn hàng');
    }
  }
);

// Đánh giá đơn hàng
export const reviewOrder = createAsyncThunk(
  'userOrder/reviewOrder',
  async ({ orderId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewOrderAPI(orderId, reviewData);
      return { ...response.data, orderId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Có lỗi xảy ra khi đánh giá đơn hàng');
    }
  }
);

const userOrderSlice = createSlice({
  name: 'userOrder',
  initialState: initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetOrderDetail: (state) => {
      state.orderDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Không thể tải danh sách đơn hàng');
      })

      // Xử lý fetchOrderDetail
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Không thể tải chi tiết đơn hàng');
      })

      // Xử lý cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật trạng thái đơn hàng bị hủy trong danh sách
        const index = state.orders.findIndex((order) => order._id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].status = 'Cancelled';
          state.orders[index].cancelReason = action.payload.reason;
        }
        // Cập nhật chi tiết đơn hàng nếu đang xem
        if (state.orderDetail && state.orderDetail._id === action.payload.orderId) {
          state.orderDetail.status = 'Cancelled';
          state.orderDetail.cancelReason = action.payload.reason;
        }
        toast.success('Đơn hàng đã được hủy thành công');
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Không thể hủy đơn hàng');
      })

      // Xử lý reviewOrder
      .addCase(reviewOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật trạng thái đã đánh giá trong danh sách
        const index = state.orders.findIndex((order) => order._id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].isReviewed = true;
        }
        // Cập nhật chi tiết đơn hàng nếu đang xem
        if (state.orderDetail && state.orderDetail._id === action.payload.orderId) {
          state.orderDetail.isReviewed = true;
        }
        toast.success('Đã đánh giá đơn hàng thành công');
      })
      .addCase(reviewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Không thể đánh giá đơn hàng');
      });
  }
});

export const { setActiveTab, resetOrderDetail } = userOrderSlice.actions;

export default userOrderSlice.reducer;
