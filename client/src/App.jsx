import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import Loading from './components/common/Loading/Loading.jsx';
import './index.css';
import { doGetAccountAction } from './redux/features/account/accountSlice.js';
import router from './routes/routes.jsx';
import { callFetchAccount } from './services/authService.js';
import { getCart } from './redux/features/cart/cartSlice.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const { isLoading, user } = useSelector((state) => state.account);

  const getAccount = async () => {
    try {
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        return;
      }

      const res = await callFetchAccount();
      if (res && res.data) {
        dispatch(doGetAccountAction(res.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user && !user.accessToken) {
      getAccount();
      dispatch(getCart());
    }
  }, []); // gọi duy nhất 1 lần khi App mount

  return (
    <div>
      {/* {isLoading === false ||
      window.location.pathname === '/login' ||
      window.location.pathname === '/register' ||
      window.location.pathname === '/' ? (
        <RouterProvider router={router} />
      ) : (
        <div className='flex h-screen items-center justify-center bg-transparent'>
          <Loading />
        </div>
      )} */}
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
