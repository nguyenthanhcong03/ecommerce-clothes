import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../services/inventoryService';

// Async thunk to fetch inventory history
export const fetchInventoryHistory = createAsyncThunk(
  'inventoryHistory/fetchInventoryHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not fetch inventory history');
    }
  }
);

const initialState = {
  inventoryHistory: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  error: null,
  filters: {
    productId: null,
    variantId: null,
    sku: '',
    type: '',
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const inventoryHistorySlice = createSlice({
  name: 'inventoryHistory',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryHistory = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventoryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch inventory history';
      });
  }
});

export const { setFilters, resetFilters, setPage, setLimit } = inventoryHistorySlice.actions;
export default inventoryHistorySlice.reducer;
