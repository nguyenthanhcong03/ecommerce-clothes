import { Route, BrowserRouter as Router, RouterProvider, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from '@layouts/MainLayout';
import AboutPage from '@pages/Customer/AboutPage/AboutPage';
import CartPage from '@pages/Customer/CartPage/CartPage';
import ContactPage from '@pages/Customer/ContactPage/ContactPage';
import HomePage from '@pages/Customer/HomePage/HomePage';
import NewsPage from '@pages/Customer/NewsPage/NewsPage';
import OurShopPage from '@pages/Customer/OurShopPage/OurShopPage';
import WishlistPage from '@pages/Customer/WishlistPage/WishlistPage';
import { useDispatch, useSelector } from 'react-redux';

// const Home = lazy(() => import('../pages/Home/Home'));
// const ProductDetail = lazy(() => import('../pages/Product/ProductDetail'));
// const Cart = lazy(() => import('../pages/Cart/Cart'));
// const Login = lazy(() => import('../pages/Auth/Login'));
// const Register = lazy(() => import('../pages/Auth/Register'));
// const NotFound = lazy(() => import('../pages/NotFound'));

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
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/shop' element={<OurShopPage />} />
            <Route path='/news' element={<NewsPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/wishlist' element={<WishlistPage />} />
          </Route>
          {/* Routes cho Admin */}
          {/* <Route path='/admin' element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path='products' element={<ProductList />} />
              <Route path='users' element={<UserList />} />
            </Route> */}
        </Routes>
      </Router>
      {/* {
        isLoading === false || window.location.pathname === '/login' || window.location.pathname === '/register' ||
        window.location.pathname === '/' ? (
          <RouterProvider router={router} />
        ): (
          <Loading />
        )
      } */}
    </div>
  );
}

export default App;
