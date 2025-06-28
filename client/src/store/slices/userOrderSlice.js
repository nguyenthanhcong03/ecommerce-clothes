import { cancelOrderAPI, getOrderByIdAPI, getUserOrdersAPI } from '@/services/orderService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setActiveTab, resetOrderDetail } = userOrderSlice.actions;

export default userOrderSlice.reducer;
