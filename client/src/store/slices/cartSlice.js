import {
  addToCartAPI,
  getCartAPI,
  removeCartItemAPI,
  removeMultipleCartItemsAPI,
  updateCartItemAPI
} from '@/services/cartService.js';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Định nghĩa async thunk để gọi API
export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
  try {
    const response = await getCartAPI();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (cartItem, { rejectWithValue }) => {
  try {
    const response = await addToCartAPI(cartItem);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await updateCartItemAPI(itemId, quantity);
      return response;
    } catch (error) {
      console.log('cartSlice.js error', error);
      return rejectWithValue(error.response?.data || 'Failed to update cart');
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (itemId, { rejectWithValue }) => {
  try {
    const response = await removeCartItemAPI(itemId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to remove item');
  }
});

export const removeMultipleCartItems = createAsyncThunk(
  'cart/removeMultipleCartItems',
  async (itemIds, { rejectWithValue }) => {
    try {
      const response = await removeMultipleCartItemsAPI(itemIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove item');
    }
  }
);

const cartSlice = createSlice({
  name: 'carts',
  initialState: {
    items: [],
    loading: false,
    loadingUpdate: false,
    loadingRemove: false,
    itemUpdate: null,
    error: null,
    totalCartItems: 0,
    totalPrice: 0
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalCartItems = 0;
      state.totalPrice = 0;
    },
    settotalCartItems: (state, action) => {
      state.totalCartItems = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.items = action.payload.data.items;
        state.totalCartItems = action.payload.data.totalCartItems;
        state.totalPrice = action.payload.data.totalPrice;
        state.loading = false;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log('accountSlice.js', action.payload);
        state.items = action.payload.data.items;
        state.totalCartItems = action.payload.data.totalCartItems;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state, action) => {
        console.log('action', action.meta.arg);
        state.loadingUpdate = true;
        state.error = null;
        state.itemUpdate = state.items.find((item) => item._id === action.meta.arg.itemId);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        // state.items = action.payload.data.items;
        state.totalCartItems = action.payload.data.totalCartItems;
        state.totalPrice = action.payload.data.totalPrice;
        state.itemUpdate = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.error = action.payload;
        state.itemUpdate = null;
      })

      // Remove Cart Item
      .addCase(removeCartItem.pending, (state) => {
        state.loadingRemove = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loadingRemove = false;
        state.items = action.payload.data.items;
        state.totalCartItems = action.payload.data.totalCartItems;
        state.totalPrice = action.payload.data.totalPrice;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loadingRemove = false;
        state.error = action.payload;
      })

      // Remove Multiple Cart Items
      .addCase(removeMultipleCartItems.pending, (state) => {
        state.loadingRemove = true;
        state.error = null;
      })
      .addCase(removeMultipleCartItems.fulfilled, (state, action) => {
        state.loadingRemove = false;
        state.items = action.payload.data.items;
        state.totalCartItems = action.payload.data.totalCartItems;
        state.totalPrice = action.payload.data.totalPrice;
      })
      .addCase(removeMultipleCartItems.rejected, (state, action) => {
        state.loadingRemove = false;
        state.error = action.payload;
      });
  }
});
export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
