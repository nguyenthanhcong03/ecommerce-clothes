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
    // Cập nhật khoảng cách để tính phí ship
    updateDistance: (state, action) => {
      if (typeof action.payload === 'number') {
        state.distance = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        // Nếu payload là object có chứa distance và shippingCost
        if ('distance' in action.payload) {
          state.distance = action.payload.distance;
        }
        if ('shippingCost' in action.payload) {
          state.shippingCost = action.payload.shippingCost;
        }
      }
    },
    // Cập nhật phí vận chuyển
    updateShippingCost: (state, action) => {
      state.shippingCost = action.payload;
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
  updateDistance,
  updateShippingCost,
  setDirectBuyItem,
  clearDirectBuyItem,
  resetOrder,
  clearOrderError,
  setCalculatingDistance
} = orderSlice.actions;

// Selectors
export const selectShippingInfo = (state) => state.order.shippingInfo;
export const selectPaymentMethod = (state) => state.order.paymentMethod;
export const selectShippingCost = (state) => state.order.shippingCost;
export const selectCouponDiscount = (state) => state.order.couponDiscount;
export const selectOrderItems = (state) => state.order.orderItems;
export const selectDirectBuyItem = (state) => state.order.directBuyItem;
export const selectAppliedCoupon = (state) => state.order.appliedCoupon;
export const selectOrderNote = (state) => state.order.note;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderSuccess = (state) => state.order.orderSuccess;
export const selectOrderError = (state) => state.order.orderError;
export const selectCurrentOrder = (state) => state.order.currentOrder;

// Tính tổng tiền sản phẩm (chưa bao gồm ship, giảm giá)
export const selectSubtotal = (state) => {
  return state.order.orderItems.reduce((total, item) => {
    const price = item.snapshot.discountPrice || item.snapshot.price;
    return total + price * item.quantity;
  }, 0);
};

// Tính tổng tiền cuối cùng (đã bao gồm ship, giảm giá)
export const selectTotalPrice = (state) => {
  const subtotal = selectSubtotal(state);
  const shippingCost = state.order.shippingCost;
  const discount = state.order.couponDiscount;

  return Math.max(0, subtotal - discount + shippingCost);
};

export default orderSlice.reducer;
