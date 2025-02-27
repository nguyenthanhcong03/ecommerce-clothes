import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './features/sidebarDrawer/sidebarSlice';
import searchSlice from './features/searchDrawer/searchSlice';
import cartSlice from './features/cart/cartSlice';

export const store = configureStore({
  reducer: { sidebar: sidebarReducer, search: searchSlice, cart: cartSlice }
});
