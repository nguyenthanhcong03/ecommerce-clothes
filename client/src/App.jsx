// import { Route, BrowserRouter as Router, RouterProvider, Routes } from 'react-router-dom';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';

import './index.css';
// import { createBrowserRouter } from 'react-router-dom';
// import HomePage from '@pages/Customer/HomePage/HomePage.jsx';
// import AboutPage from '@pages/Customer/AboutPage/AboutPage.jsx';
// import LoginPage from '@pages/Auth/LoginPage.jsx';
// import RegisterPage from '@pages/Auth/RegisterPage.jsx';
// import MainLayout from '@layouts/MainLayout.jsx';
// import AdminLayout from '@layouts/AdminLayout.jsx';
// import OurShopPage from '@pages/Customer/OurShopPage/OurShopPage.jsx';
// import NewsPage from '@pages/Customer/NewsPage/NewsPage.jsx';
// import ContactPage from '@pages/Customer/ContactPage/ContactPage.jsx';
// import CartPage from '@pages/Customer/CartPage/CartPage.jsx';
// import WishlistPage from '@pages/Customer/WishlistPage/WishlistPage.jsx';
// import DetailProduct from '@pages/Customer/DetailProduct/DetailProduct.jsx';
// import Dashboard from '@pages/Admin/Dashboard/Dashboard.jsx';
// import ManageProduct from '@pages/Admin/ManageProduct/ManageProduct.jsx';
// import ManageUser from '@pages/Admin/ManageUser/ManageUser.jsx';
// import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Loading from './components/Loading/Loading.jsx';
import { useEffect } from 'react';
import { callFetchAccount } from './services/authService.js';
import { doGetAccountAction } from './redux/features/account/accountSlice.js';
import router from './routes/routes.jsx';
import { RouterProvider } from 'react-router-dom';

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <MainLayout />,
//     errorElement: <div>404</div>,
//     children: [
//       { index: true, element: <HomePage /> },
//       {
//         path: 'register',
//         element: <RegisterPage />
//       },
//       {
//         path: 'login',
//         element: <LoginPage />
//       },
//       {
//         path: 'about',
//         element: <AboutPage />
//       },
//       {
//         path: 'shop',
//         element: <OurShopPage />
//       },
//       {
//         path: 'news',
//         element: <NewsPage />
//       },
//       {
//         path: 'contact',
//         element: <ContactPage />
//       },
//       {
//         path: 'cart',
//         element: <CartPage />
//       },
//       {
//         path: 'wishlist',
//         element: <WishlistPage />
//       },
//       {
//         path: 'product/:id',
//         element: <DetailProduct />
//       }
//     ]
//   },
//   {
//     path: 'admin',
//     element: <AdminLayout />,
//     errorElement: <div>404</div>,
//     children: [
//       {
//         index: true,
//         // path: '/dashboard',
//         element: (
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'products',
//         element: <ManageProduct />
//       },
//       {
//         path: 'users',
//         element: <ManageUser />
//       }
//     ]
//   }
// ]);

function App() {
  const dispacth = useDispatch();
  const isLoading = useSelector((state) => state.account.isLoading);

  const getAccount = async () => {
    try {
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        return;
      }

      const res = await callFetchAccount();
      if (res && res.data) {
        dispacth(doGetAccountAction(res.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAccount();
  });
  return (
    <div>
      {isLoading === false ||
      window.location.pathname === '/login' ||
      window.location.pathname === '/register' ||
      window.location.pathname === '/' ? (
        <RouterProvider router={router} />
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
