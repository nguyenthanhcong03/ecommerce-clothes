import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCartByUser } from '@services/cartService';

const initialState = {
  carts: []
};

export const fetchCartByUser = createAsyncThunk('cart/fetchCartByUser', async () => {
  const res = await getCartByUser();
  const data = await res.json();
  return data;
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCartByUser.fulfilled, (state, action) => {
      state.carts = action.payload;
    });
  }
});

// Action creators are generated for each case reducer function
export const { toggleSearch } = cartSlice.actions;

export default cartSlice.reducer;
