import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './features/account/accountSlice';
import cartReducer from './features/cart/cartSlice';
import searchReducer from './features/searchDrawer/searchSlice';
import sidebarReducer from './features/sidebarDrawer/sidebarSlice';

export const store = configureStore({
  reducer: { sidebar: sidebarReducer, search: searchReducer, cart: cartReducer, account: accountReducer }
});
