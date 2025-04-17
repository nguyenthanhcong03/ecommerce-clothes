import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  addToCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService
} from '@/services/cartService.js';

// Định nghĩa async thunk để gọi API
export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
  try {
    const response = await getCartService();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (product, { rejectWithValue }) => {
  const cartItem = {
    productId: product._id,
    variantId: product.variants[0]._id,
    quantity: 1,
    snapshot: {
      name: product.name,
      price: product.variants[0].price,
      discountPrice: product.variants[0].discountPrice,
      color: product.variants[0].color,
      size: product.variants[0].size,
      image: product.variants[0].images[0]
    }
  };
  try {
    const response = await addToCartService(cartItem);
    toast.success('Thêm vào giỏ hàng thành công');
    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    return rejectWithValue(error.response?.data || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const response = await updateCartItemService({
        productId,
        variantId,
        quantity
      });
      toast.success('Cập nhật giỏ hàng thành công');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật giỏ hàng thất bại');
      return rejectWithValue(error.response?.data || 'Failed to update cart');
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (itemId, { rejectWithValue }) => {
  try {
    const response = await removeCartItemService(itemId);
    toast.success('Xóa sản phẩm thành công');
    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại');
    return rejectWithValue(error.response?.data || 'Failed to remove item');
  }
});

const cartSlice = createSlice({
  name: 'carts',
  initialState: {
    items: [],
    loading: false,
    loadingUpdate: false,
    loadingRemove: false,
    itemUpdate: null,
    error: null,
    totalQuantity: 0,
    totalPrice: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalQuantity = action.payload.totalQuantity;
        state.totalPrice = action.payload.totalPrice;
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
        state.items = action.payload.cart.items;
        state.totalQuantity = action.payload.cart.totalQuantity;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state, action) => {
        state.loadingUpdate = true;
        state.error = null;
        state.itemUpdate = state.items.find(
          (item) => item.productId === action.meta.arg.productId && item.variantId === action.meta.arg.variantId
        );
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        state.items = action.payload.cart.items;
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
        console.log('accion.payload', action.payload);
        state.loadingRemove = false;
        state.items = action.payload.data.items;
        state.totalPrice = action.payload.data.totalPrice;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loadingRemove = false;
        state.error = action.payload;
      });
  }
});

export default cartSlice.reducer;
