import { createBrowserRouter } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';

// Layouts
import AdminLayout from '@/layouts/AdminLayout.jsx';
import MainLayout from '@/layouts/MainLayout.jsx';

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute/ProtectedRoute.jsx';
import NotFound from '@/components/auth/NotFound/NotFound.jsx';

// Pages
import HomePage from '@/pages/customer/HomePage/HomePage.jsx';
import AboutPage from '@/pages/customer/AboutPage/AboutPage.jsx';
import OurShopPage from '@/pages/customer/OurShopPage/OurShopPage.jsx';
import NewsPage from '@/pages/customer/NewsPage/NewsPage.jsx';
import ContactPage from '@/pages/customer/ContactPage/ContactPage.jsx';
import DetailProduct from '@/pages/customer/DetailProduct/DetailProduct.jsx';
import PaymentSuccessPage from '@/pages/customer/PaymentSuccessPage/PaymentSuccessPage.jsx';
import PaymentFailedPage from '@/pages/customer/PaymentFailedPage/PaymentFailedPage.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import Unauthorized from '@/components/auth/Unauthorized/Unauthorized.jsx';
import CartPage from '@/pages/customer/CartPage/CartPage.jsx';
import WishlistPage from '@/pages/customer/WishlistPage/WishlistPage.jsx';
import CheckoutPage from '@/pages/customer/CheckoutPage/CheckoutPage.jsx';

import OverviewPage from '@/pages/admin/OverviewPage/OverviewPage.jsx';
import ProductPage from '@/pages/admin/ProductPage/ProductPage.jsx';
import CategoryPage from '@/pages/admin/CategoryPage/CategoryPage.jsx';
import UserPage from '@/pages/admin/UserPage/UserPage.jsx';
import SalesPage from '@/pages/admin/SalesPage/SalesPage.jsx';
import OrdersPage from '@/pages/admin/OrdersPage/OrdersPage.jsx';
import AnalyticsPage from '@/pages/admin/AnalyticsPage/AnalyticsPage.jsx';
import SettingsPage from '@/pages/admin/SettingsPage/SettingsPage.jsx';
import CouponPage from '@/pages/admin/CouponPage/CouponPage.jsx';

// Fake delay function
// const lazyWithDelay = (importFunc, delay = 1000) => {
//   return React.lazy(() =>
//     Promise.all([
//       importFunc(),
//       new Promise((resolve) => setTimeout(resolve, delay)) // fake delay
//     ]).then(([moduleExports]) => moduleExports)
//   );
// };

// Loading fallback for all lazy-loaded components
const LoadingFallback = () => (
  <div className='flex h-screen w-full items-center justify-center bg-white'>
    <div className='h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-primaryColor'></div>
  </div>
);

// Helper function for wrapping components with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// Public routes accessible to all users
const publicRoutes = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'shop', element: <OurShopPage /> },
  { path: 'news', element: <NewsPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'product/:id', element: <DetailProduct /> },
  { path: 'payment-success', element: <PaymentSuccessPage /> },
  { path: 'payment-failed', element: <PaymentFailedPage /> }
];

// Auth routes (login/register)
const authRoutes = [
  {
    path: 'login',
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'register',
    element: (
      <ProtectedRoute requireAuth={false}>
        <RegisterPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'unauthorized',
    element: <Unauthorized />
  }
];

// Customer authenticated routes
const customerProtectedRoutes = [
  {
    path: 'cart',
    element: (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'wishlist',
    element: (
      <ProtectedRoute>
        <WishlistPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'checkout',
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    )
  }
];

// Admin
const adminRoutes = [
  { index: true, element: <OverviewPage /> },
  { path: 'products', element: <ProductPage /> },
  { path: 'categories', element: <CategoryPage /> },
  { path: 'users', element: <UserPage /> },
  { path: 'sales', element: <SalesPage /> },
  { path: 'orders', element: <OrdersPage /> },
  { path: 'analytics', element: <AnalyticsPage /> },
  { path: 'settings', element: <SettingsPage /> },
  { path: 'coupons', element: <CouponPage /> }
];

// Main router configuration
const Router = [
  {
    path: '/',
    element: withSuspense(MainLayout),
    errorElement: <NotFound />,
    children: [...publicRoutes, ...authRoutes, ...customerProtectedRoutes]
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute roles={['admin', 'manager']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: adminRoutes
  },
  {
    path: '*',
    element: <NotFound />
  }
];

const router = createBrowserRouter(Router);
export default router;
