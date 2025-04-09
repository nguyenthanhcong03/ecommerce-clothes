import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './features/account/accountSlice';
import productReducer from './features/product/productSlice';
import userReducer from './features/user/userSlice';
import categoryReducer from './features/category/categorySlice';
import cartReducer from './features/cart/cartSlice';
import searchReducer from './features/searchDrawer/searchSlice';
import sidebarReducer from './features/sidebarDrawer/sidebarSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    search: searchReducer,
    cart: cartReducer,
    account: accountReducer,
    product: productReducer,
    user: userReducer,
    category: categoryReducer
  }
});
