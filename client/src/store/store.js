import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slices/accountSlice';
import productReducer from './slices/productSlice';
import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import searchReducer from './slices/searchSlice';
import sidebarReducer from './slices/sidebarSlice';
import couponReducer from './slices/couponSlice';
import orderReducer from './slices/orderSlice';
import userOrderReducer from './slices/userOrderSlice';
import adminOrderReducer from './slices/adminOrderSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    sidebar: sidebarReducer,
    search: searchReducer,
    cart: cartReducer,
    product: productReducer,
    user: userReducer,
    category: categoryReducer,
    coupon: couponReducer,
    order: orderReducer,
    userOrder: userOrderReducer,
    adminOrder: adminOrderReducer
  }
});
