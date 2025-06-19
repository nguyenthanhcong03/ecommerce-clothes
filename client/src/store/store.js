import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slices/accountSlice';
import adminCouponReducer from './slices/adminCouponSlice';
import adminOrderReducer from './slices/adminOrderSlice';
import adminProductReducer from './slices/adminProductSlice';
import adminReviewReducer from './slices/adminReviewSlice';
import adminUserReducer from './slices/adminUserSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import couponReducer from './slices/couponSlice';
import orderReducer from './slices/orderSlice';
import productReducer from './slices/productSlice';
import reviewReducer from './slices/reviewSlice';
import searchReducer from './slices/searchSlice';
import shopReducer from './slices/shopSlice';
import sidebarReducer from './slices/sidebarSlice';
import userOrderReducer from './slices/userOrderSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    sidebar: sidebarReducer,
    search: searchReducer,
    cart: cartReducer,
    product: productReducer,
    shop: shopReducer,
    user: userReducer,
    category: categoryReducer,
    coupon: couponReducer,
    order: orderReducer,
    userOrder: userOrderReducer,
    review: reviewReducer,
    adminProduct: adminProductReducer,
    adminOrder: adminOrderReducer,
    adminUser: adminUserReducer,
    adminCoupon: adminCouponReducer,
    adminReview: adminReviewReducer
  }
});
