// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { lazy } from 'react';
// import { Navigate, createBrowserRouter } from 'react-router';
// import Loadable from 'src/layouts/full/shared/loadable/Loadable';

// /* ***Layouts**** */
// const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
// const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// // Dashboard
// const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// // utilities
// const Typography = Loadable(lazy(() => import('../views/typography/Typography')));
// const Table = Loadable(lazy(() => import('../views/tables/Table')));
// const Form = Loadable(lazy(() => import('../views/forms/Form')));
// const Shadow = Loadable(lazy(() => import('../views/shadows/Shadow')));

// // icons
// const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// // authentication
// const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
// const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
// const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
// const Error = Loadable(lazy(() => import('../views/auth/error/Error')));
import HomePage from '@pages/Customer/HomePage/HomePage.jsx';
import AboutPage from '@pages/Customer/AboutPage/AboutPage.jsx';
import LoginPage from '@pages/Auth/LoginPage.jsx';
import RegisterPage from '@pages/Auth/RegisterPage.jsx';
import MainLayout from '@layouts/MainLayout.jsx';
import AdminLayout from '@layouts/AdminLayout.jsx';
import OurShopPage from '@pages/Customer/OurShopPage/OurShopPage.jsx';
import NewsPage from '@pages/Customer/NewsPage/NewsPage.jsx';
import ContactPage from '@pages/Customer/ContactPage/ContactPage.jsx';
import CartPage from '@pages/Customer/CartPage/CartPage.jsx';
import WishlistPage from '@pages/Customer/WishlistPage/WishlistPage.jsx';
import DetailProduct from '@pages/Customer/DetailProduct/DetailProduct.jsx';
import OverviewPage from '@pages/Admin/OverviewPage/OverviewPage.jsx';
import UsersPage from '@pages/Admin/UsersPage/UsersPage.jsx';
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute.jsx';
import SettingsPage from '@pages/Admin/SettingsPage/SettingsPage.jsx';
import SalesPage from '@pages/Admin/SalesPage/SalesPage.jsx';
import OrdersPage from '@pages/Admin/OrdersPage/OrdersPage.jsx';
import AnalyticsPage from '@pages/Admin/AnalyticsPage/AnalyticsPage.jsx';
import { createBrowserRouter } from 'react-router-dom';
import CategoryPage from '@pages/Admin/CategoryPage/CategoryPage';
import ProductPage from '@pages/Admin/ProductPage/ProductPage';

const Router = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <div>404</div>,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'shop',
        element: <OurShopPage />
      },
      {
        path: 'news',
        element: <NewsPage />
      },
      {
        path: 'contact',
        element: <ContactPage />
      },
      {
        path: 'cart',
        element: <CartPage />
      },
      {
        path: 'wishlist',
        element: <WishlistPage />
      },
      {
        path: 'product/:id',
        element: <DetailProduct />
      }
    ]
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    errorElement: <div>404</div>,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <OverviewPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'products',
        element: <ProductPage />
      },
      {
        path: 'categories',
        element: <CategoryPage />
      },
      {
        path: 'users',
        element: <UsersPage />
      },
      {
        path: 'sales',
        element: <SalesPage />
      },
      {
        path: 'orders',
        element: <OrdersPage />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
];

const router = createBrowserRouter(Router);
// const router = createBrowserRouter(Router, { basename: '/MatDash' });
export default router;
