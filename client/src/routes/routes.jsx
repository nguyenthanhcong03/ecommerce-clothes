import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '@/routes/layouts/AdminLayout.jsx';
import AuthLayout from '@/routes/layouts/AuthLayout.jsx';
import MainLayout from '@/routes/layouts/MainLayout.jsx';

// Components
import NotFound from '@/components/auth/NotFound/NotFound.jsx';
import ProtectedRoute from '@/routes/guards/ProtectedRoute.jsx';

// Pages
import Unauthorized from '@/components/auth/Unauthorized/Unauthorized.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import AboutPage from '@/pages/customer/AboutPage/AboutPage.jsx';
import ReviewOrderProductsPage from '@/pages/customer/AccountPage/OrderPage/ReviewOrderProductsPage.jsx';
import UserReviewsPage from '@/pages/customer/AccountPage/UserReviewsPage/UserReviewsPage.jsx';
import CartPage from '@/pages/customer/CartPage/CartPage.jsx';
import CheckoutPage from '@/pages/customer/CheckoutPage/CheckoutPage.jsx';
import ContactPage from '@/pages/customer/ContactPage/ContactPage.jsx';
import HomePage from '@/pages/customer/HomePage/HomePage.jsx';
import NewsPage from '@/pages/customer/NewsPage/NewsPage.jsx';
import ProductDetail from '@/pages/customer/ProductDetail/ProductDetail.jsx';

import AccountLayout from '@/components/layout/AccountLayout';
import AnalyticsPage from '@/pages/admin/AnalyticsPage/AnalyticsPage.jsx';
import CategoryPage from '@/pages/admin/CategoryPage/CategoryPage.jsx';
import CouponPage from '@/pages/admin/CouponPage/CouponPage.jsx';
import InventoryPage from '@/pages/admin/InventoryPage/InventoryPage.jsx';
import OrdersPage from '@/pages/admin/OrdersPage/OrdersPage.jsx';
import OverviewPage from '@/pages/admin/OverviewPage/OverviewPage.jsx';
import ProductPage from '@/pages/admin/ProductPage/ProductPage.jsx';
import SettingsPage from '@/pages/admin/SettingsPage/SettingsPage.jsx';
import UserPage from '@/pages/admin/UserPage/UserPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ChangePasswordPage from '@/pages/customer/AccountPage/ChangePasswordPage/ChangePasswordPage.jsx';
import OrderDetailPage from '@/pages/customer/AccountPage/OrderPage/OrderDetailPage.jsx';
import OrderPage from '@/pages/customer/AccountPage/OrderPage/OrderPage.jsx';
import PrivacyPage from '@/pages/customer/AccountPage/PrivacyPage/PrivacyPage.jsx';
import ProfilePage from '@/pages/customer/AccountPage/ProfilePage/ProfilePage.jsx';
import VoucherPage from '@/pages/customer/AccountPage/VoucherPage/VoucherPage.jsx';
import OurShopPage from '@/pages/customer/OurShopPage/OurShopPage';
import PaymentFailedPage from '@/pages/customer/PaymentFailedPage/PaymentFailedPage.jsx';
import PaymentSuccessPage from '@/pages/customer/PaymentSuccessPage/PaymentSuccessPage.jsx';
import Example from '../components/examples/Example';

const publicRoutes = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'shop', element: <OurShopPage /> },
  { path: 'shop/:nameId', element: <OurShopPage /> },
  { path: 'news', element: <NewsPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'product/:nameId', element: <ProductDetail /> },
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
  }
];

// Khách hàng đã đăng nhập
const customerProtectedRoutes = [
  {
    path: 'cart',
    element: (
      <ProtectedRoute roles={['customer']}>
        <CartPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'checkout',
    element: (
      <ProtectedRoute roles={['customer']}>
        <CheckoutPage />
      </ProtectedRoute>
    )
  },
  {
    path: 'user',
    element: (
      <ProtectedRoute roles={['admin', 'customer']}>
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
        path: 'order',
        element: (
          <ProtectedRoute roles={['customer']}>
            <OrderPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'order/detail/:orderId',
        element: (
          <ProtectedRoute roles={['customer']}>
            <OrderDetailPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'order/review-products/:orderId',
        element: (
          <ProtectedRoute roles={['customer']}>
            <ReviewOrderProductsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'reviews',
        element: (
          <ProtectedRoute roles={['customer']}>
            <UserReviewsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'vouchers',
        element: (
          <ProtectedRoute roles={['customer']}>
            <VoucherPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: 'unauthorized',
    element: <Unauthorized />
  }
];

// Admin
const adminRoutes = [
  { index: true, element: <Navigate to='products' replace /> },
  { path: 'products', element: <ProductPage /> },
  { path: 'categories', element: <CategoryPage /> },
  { path: 'inventory', element: <InventoryPage /> },
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
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: authRoutes
  },
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [...publicRoutes, ...authRoutes, ...customerProtectedRoutes]
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute roles={['admin']}>
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
