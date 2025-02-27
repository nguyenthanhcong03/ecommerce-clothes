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
import OurShopPage from '@pages/Customer/OurShopPage/OurShopPage.jsx';
import NewsPage from '@pages/Customer/NewsPage/NewsPage.jsx';
import ContactPage from '@pages/Customer/ContactPage/ContactPage.jsx';
import CartPage from '@pages/Customer/CartPage/CartPage.jsx';
import WishlistPage from '@pages/Customer/WishlistPage/WishlistPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: '/about',
        element: <AboutPage />
      },
      {
        path: '/shop',
        element: <OurShopPage />
      },
      {
        path: '/news',
        element: <NewsPage />
      },
      {
        path: '/contact',
        element: <ContactPage />
      },
      {
        path: '/cart',
        element: <CartPage />
      },
      {
        path: '/wishlist',
        element: <WishlistPage />
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      {/* <App /> */}
    </Provider>
  </StrictMode>
);
