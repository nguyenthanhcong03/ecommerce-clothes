import { combineReducers } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';
import adminCouponReducer from './adminCouponSlice';
import adminInventoryReducer from './adminInventorySlice';
import adminOrderReducer from './adminOrderSlice';
import adminProductReducer from './adminProductSlice';
import adminReviewReducer from './adminReviewSlice';
import adminUserReducer from './adminUserSlice';
import cartReducer from './cartSlice';
import categoryReducer from './categorySlice';
import couponReducer from './couponSlice';
import inventoryHistoryReducer from './inventoryHistorySlice';
import orderReducer from './orderSlice';
import productReducer from './productSlice';
import reviewReducer from './reviewSlice';
import searchReducer from './searchSlice';
import shopReducer from './shopSlice';
import sidebarReducer from './sidebarSlice';
import userOrderReducer from './userOrderSlice';
import userReducer from './userSlice';

const appReducer = combineReducers({
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
  adminReview: adminReviewReducer,
  adminInventory: adminInventoryReducer,
  inventoryHistory: inventoryHistoryReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_ALL') {
    state = undefined; // Reset toàn bộ state
  }
  return appReducer(state, action);
};

export default rootReducer;
