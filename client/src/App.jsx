import { fetchCurrentUser } from '@/store/slices/accountSlice.js';
import { getCart } from '@/store/slices/cartSlice.js';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';
import router from './routes/routes.jsx';

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.account);

  useEffect(() => {
    if (user && !user.accessToken) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Sau khi đã xác thực người dùng thành công, tải giỏ hàng
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
