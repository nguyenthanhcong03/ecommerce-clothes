import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { store } from './redux/store.js';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import Dashboard from '@pages/Admin/Dashboard/Dashboard.jsx';
import ManageProduct from '@pages/Admin/ManageProduct/ManageProduct.jsx';
import ManageUser from '@pages/Admin/ManageUser/ManageUser.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';

const router = createBrowserRouter([
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
        // path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'products',
        element: <ManageProduct />
      },
      {
        path: 'users',
        element: <ManageUser />
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Provider>
  </StrictMode>
);
