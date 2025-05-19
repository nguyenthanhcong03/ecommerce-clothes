import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllOrdersAPI, updateOrderStatusAPI } from '../../services/orderService.js';

// Trạng thái ban đầu
const initialState = {
  orders: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  summary: {
    totalOrders: 0,
    totalRevenue: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined
  },
  loading: false,
  error: null
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    const data = await getAllOrdersAPI(params);
    console.log('orders', data);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatusAPI(orderId, status);
      console.log('da', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: 'adminOrder',
  initialState,
  reducers: {
    // Xóa trạng thái lỗi
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // LẤY TẤT CẢ ĐƠN HÀNG
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.orders || [];
        state.pagination = action.payload.data.pagination;

        // Lưu thông tin tổng kết nếu có
        if (action.payload.data.summary) {
          state.summary = action.payload.data.summary;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);
        state.loading = false;
        const updatedOrder = action.payload.data;
        const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearError, setFilters } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
