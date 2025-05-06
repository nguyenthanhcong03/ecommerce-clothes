import ProtectedRoute from '@/components/auth/ProtectedRoute/ProtectedRoute.jsx';
import NotFound from '@/components/auth/NotFound/NotFound.jsx';
import AdminLayout from '@/layouts/AdminLayout.jsx';
import MainLayout from '@/layouts/MainLayout.jsx';

// Admin pages
import AnalyticsPage from '@/pages/Admin/AnalyticsPage/AnalyticsPage.jsx';
import CategoryPage from '@/pages/Admin/CategoryPage/CategoryPage';
import OrdersPage from '@/pages/Admin/OrdersPage/OrdersPage.jsx';
import OverviewPage from '@/pages/Admin/OverviewPage/OverviewPage.jsx';
import ProductPage from '@/pages/Admin/ProductPage/ProductPage';
import SalesPage from '@/pages/Admin/SalesPage/SalesPage.jsx';
import SettingsPage from '@/pages/Admin/SettingsPage/SettingsPage.jsx';
import UsersPage from '@/pages/Admin/UsersPage/UsersPage.jsx';
import CouponPage from '@/pages/Admin/CouponPage/CouponPage.jsx';

// Auth pages
import LoginPage from '@/pages/Auth/LoginPage.jsx';
import RegisterPage from '@/pages/Auth/RegisterPage.jsx';

// Customer pages
import AboutPage from '@/pages/Customer/AboutPage/AboutPage.jsx';
import CartPage from '@/pages/Customer/CartPage/CartPage.jsx';
import ContactPage from '@/pages/Customer/ContactPage/ContactPage.jsx';
import DetailProduct from '@/pages/Customer/DetailProduct/DetailProduct.jsx';
import HomePage from '@/pages/Customer/HomePage/HomePage.jsx';
import NewsPage from '@/pages/Customer/NewsPage/NewsPage.jsx';
import OurShopPage from '@/pages/Customer/OurShopPage/OurShopPage.jsx';
import WishlistPage from '@/pages/Customer/WishlistPage/WishlistPage.jsx';
import PaymentSuccessPage from '@/pages/Customer/PaymentSuccessPage/PaymentSuccessPage.jsx';
import PaymentFailedPage from '@/pages/Customer/PaymentFailedPage/PaymentFailedPage.jsx';

import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import InputFormExample from '../components/examples/InputFormExample';
import CheckoutPage from '../pages/Customer/CheckoutPage/CheckoutPage';

// Lazy-loaded components for better performance
const UnauthorizedPage = lazy(() => import('@/components/auth/Unauthorized/Unauthorized.jsx'));

const Router = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'shop', element: <OurShopPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'product/:id', element: <DetailProduct /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-failed', element: <PaymentFailedPage /> },

      // Auth routes
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
        element: (
          <Suspense fallback={<div className='loading'>Loading...</div>}>
            <UnauthorizedPage />
          </Suspense>
        )
      },

      // Customer authenticated routes
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
    ]
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute roles={['admin', 'manager']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'products', element: <ProductPage /> },
      { path: 'categories', element: <CategoryPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'coupons', element: <CouponPage /> },
      { path: 'example', element: <InputFormExample /> }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
];

const router = createBrowserRouter(Router);
export default router;
