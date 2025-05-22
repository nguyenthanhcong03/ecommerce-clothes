import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calculateShippingFee, getDistanceAPI } from '../../services/mapService';
import { createOrderAPI } from '../../services/orderService';

const initialState = {
  orderItems: [],
  shippingInfo: null,
  paymentMethod: 'COD', // Mặc định là thanh toán khi nhận hàng
  couponDiscount: 0,
  appliedCoupon: null,
  note: '',
  distance: 0,
  shippingCost: 0,
  loading: false,
  orderSuccess: false,
  orderError: null,
  currentOrder: null,
  calculatingDistance: false // Trạng thái để theo dõi việc tính toán phí vận chuyển
};

export const calculateDistance = createAsyncThunk(
  'order/calculateDistance',
  async ({ storeLocation, customerLocation }, { rejectWithValue }) => {
    console.log(storeLocation, customerLocation);
    try {
      const distance = await getDistanceAPI(storeLocation, customerLocation);
      return distance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tính phí vận chuyển');
    }
  }
);

export const createNewOrder = createAsyncThunk('order/createNewOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await createOrderAPI(orderData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể tạo đơn hàng');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Lưu thông tin giao hàng
    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },
    // Cập nhật phương thức thanh toán
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    // Thêm sản phẩm vào đơn hàng từ giỏ hàng
    setOrderItems: (state, action) => {
      state.orderItems = action.payload;
    },
    // Áp dụng mã giảm giá
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload.coupon;
      state.couponDiscount = action.payload.discountAmount;
    },
    // Xóa mã giảm giá đã áp dụng
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
    // Cập nhật ghi chú cho đơn hàng
    updateOrderNote: (state, action) => {
      state.note = action.payload;
    },
    // Reset state sau khi hoàn thành đơn hàng
    resetOrder: (state) => {
      return {
        ...initialState,
        shippingInfo: state.shippingInfo // Giữ thông tin giao hàng cho lần sau
      };
    },
    // Reset thông báo lỗi
    clearOrderError: (state) => {
      state.orderError = null;
    },
    setCalculatingDistance: (state) => {
      state.calculatingDistance = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateDistance.pending, (state) => {
        state.calculatingDistance = true;
      })
      .addCase(calculateDistance.fulfilled, (state, action) => {
        state.calculatingDistance = false;
        state.distance = action.payload;
        // Tính phí ship dựa trên khoảng cách
        state.shippingCost = calculateShippingFee(action.payload);
      })
      .addCase(calculateDistance.rejected, (state, action) => {
        state.calculatingDistance = false;
        state.orderError = action.payload;
      })

      // Xử lý createNewOrder
      .addCase(createNewOrder.pending, (state) => {
        state.loading = true;
        state.orderSuccess = false;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderSuccess = true;
        state.currentOrder = action.payload;
        // Không reset state ở đây để có thể hiển thị thông tin xác nhận đơn hàng
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.loading = false;
        state.orderSuccess = false;
        state.orderError = action.payload;
      });
  }
});

export const {
  saveShippingInfo,
  setPaymentMethod,
  setOrderItems,
  applyCoupon,
  removeCoupon,
  updateOrderNote,
  resetOrder,
  clearOrderError,
  setCalculatingDistance
} = orderSlice.actions;

export default orderSlice.reducer;
