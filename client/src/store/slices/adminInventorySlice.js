import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../services/inventoryService';
import { getProductByIdAPI } from '../../services/productService';

// Async thunk để lấy thông tin chi tiết sản phẩm
export const fetchProductDetail = createAsyncThunk(
  'adminInventory/fetchProductDetail',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getProductByIdAPI(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response || 'Lỗi khi lấy thông tin sản phẩm');
    }
  }
);

// Async thunk để cập nhật hàng loạt
export const bulkUpdateStock = createAsyncThunk('adminInventory/bulkUpdateStock', async (data, { rejectWithValue }) => {
  try {
    const response = await inventoryService.bulkUpdateStock(data);
    return response;
  } catch (error) {
    return rejectWithValue(error.response || 'Lỗi khi cập nhật tồn kho');
  }
});

// Async thunk để lấy danh sách sản phẩm có tồn kho thấp
export const fetchLowStockProducts = createAsyncThunk(
  'adminInventory/fetchLowStockProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getLowStockProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response || 'Lỗi khi lấy danh sách sản phẩm tồn kho thấp');
    }
  }
);

const initialState = {
  selectedProduct: null,
  lowStockProducts: [],
  loading: false,
  productDetailLoading: false,
  bulkUpdateLoading: false,
  error: null,
  totalLowStock: 0,
  success: false
};

const adminInventorySlice = createSlice({
  name: 'adminInventory',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchProductDetail
      .addCase(fetchProductDetail.pending, (state) => {
        state.productDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.productDetailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.productDetailLoading = false;
        state.error = action.payload || 'Lỗi khi lấy thông tin sản phẩm';
      })

      // Xử lý bulkUpdateStock
      .addCase(bulkUpdateStock.pending, (state) => {
        state.bulkUpdateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkUpdateStock.fulfilled, (state) => {
        state.bulkUpdateLoading = false;
        state.success = true;
      })
      .addCase(bulkUpdateStock.rejected, (state, action) => {
        state.bulkUpdateLoading = false;
        state.error = action.payload || 'Lỗi khi cập nhật tồn kho';
      })

      // Xử lý fetchLowStockProducts
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload.data;
        state.totalLowStock = action.payload.pagination.total;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi lấy danh sách sản phẩm tồn kho thấp';
      });
  }
});

export const { clearSelectedProduct, clearSuccess, clearError } = adminInventorySlice.actions;

export default adminInventorySlice.reducer;
