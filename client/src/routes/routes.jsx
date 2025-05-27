import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '@/routes/layouts/AdminLayout.jsx';
import MainLayout from '@/routes/layouts/MainLayout.jsx';

// Components
import NotFound from '@/components/auth/NotFound/NotFound.jsx';
import ProtectedRoute from '@/routes/guards/ProtectedRoute.jsx';

// Pages
import Unauthorized from '@/components/auth/Unauthorized/Unauthorized.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import AboutPage from '@/pages/customer/AboutPage/AboutPage.jsx';
import CartPage from '@/pages/customer/CartPage/CartPage.jsx';
import CheckoutPage from '@/pages/customer/CheckoutPage/CheckoutPage.jsx';
import ContactPage from '@/pages/customer/ContactPage/ContactPage.jsx';
import ProductDetail from '@/pages/customer/ProductDetail/ProductDetail.jsx';
import HomePage from '@/pages/customer/HomePage/HomePage.jsx';
import NewsPage from '@/pages/customer/NewsPage/NewsPage.jsx';
import PaymentFailedPage from '@/pages/customer/PaymentStatusPage/PaymentFailedPage.jsx';
import PaymentSuccessPage from '@/pages/customer/PaymentStatusPage/PaymentSuccessPage.jsx';
import WishlistPage from '@/pages/customer/WishlistPage/WishlistPage.jsx';

import AccountLayout from '@/components/layout/AccountLayout';
import AnalyticsPage from '@/pages/admin/AnalyticsPage/AnalyticsPage.jsx';
import CategoryPage from '@/pages/admin/CategoryPage/CategoryPage.jsx';
import CouponPage from '@/pages/admin/CouponPage/CouponPage.jsx';
import OrdersPage from '@/pages/admin/OrdersPage/OrdersPage.jsx';
import OverviewPage from '@/pages/admin/OverviewPage/OverviewPage.jsx';
import ProductPage from '@/pages/admin/ProductPage/ProductPage.jsx';
import SettingsPage from '@/pages/admin/SettingsPage/SettingsPage.jsx';
import UserPage from '@/pages/admin/UserPage/UserPage.jsx';
import ChangePasswordPage from '@/pages/customer/AccountPage/ChangePasswordPage.jsx';
import OrderDetailPage from '@/pages/customer/AccountPage/OrderDetailPage.jsx';
import OrderPage from '@/pages/customer/AccountPage/OrderPage.jsx';
import OrderReviewPage from '@/pages/customer/AccountPage/OrderReviewPage.jsx';
import PrivacyPage from '@/pages/customer/AccountPage/PrivacyPage.jsx';
import ProfilePage from '@/pages/customer/AccountPage/ProfilePage.jsx';
import VoucherPage from '@/pages/customer/AccountPage/VoucherPage.jsx';
import Example from '../components/examples/Example';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import MyShopPage from '@/pages/customer/MyShopPage/MyShopPage';

const publicRoutes = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'shop', element: <MyShopPage /> },
  { path: 'news', element: <NewsPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'product/:id', element: <ProductDetail /> },
  { path: 'checkout', element: <CheckoutPage /> },
  { path: 'payment-success', element: <PaymentSuccessPage /> },
  { path: 'payment-failed', element: <PaymentFailedPage /> },
  { path: 'example', element: <Example /> }
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
    path: 'forgot-password',
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPasswordPage />
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
    path: 'user',
    element: (
      <ProtectedRoute>
        <AccountLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to='profile' replace />
      },
      {
        path: 'profile',

        element: <ProfilePage />
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />
      },
      {
        path: 'privacy-settings',
        element: <PrivacyPage />
      },
      {
        path: 'orders',
        element: <OrderPage />
      },
      {
        path: 'order/detail/:orderId',
        element: <OrderDetailPage />
      },
      {
        path: 'order/review/:orderId',
        element: <OrderReviewPage />
      },
      {
        path: 'vouchers',
        element: <VoucherPage />
      }
    ]
  }
];

// Admin
const adminRoutes = [
  { index: true, element: <OverviewPage /> },
  { path: 'products', element: <ProductPage /> },
  { path: 'categories', element: <CategoryPage /> },
  { path: 'users', element: <UserPage /> },
  { path: 'orders', element: <OrdersPage /> },
  { path: 'analytics', element: <AnalyticsPage /> },
  { path: 'settings', element: <SettingsPage /> },
  { path: 'coupons', element: <CouponPage /> }
];

// Main router configuration
const Router = [
  {
    path: '/',
    element: <MainLayout />,
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
