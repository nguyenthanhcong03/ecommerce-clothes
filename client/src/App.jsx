import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';
import './index.css';
import { fetchCurrentUser } from './redux/features/account/accountSlice.js';
import { getCart } from './redux/features/cart/cartSlice.js';
import router from './routes/routes.jsx';

function App() {
  const dispatch = useDispatch();
  const { isLoading, user } = useSelector((state) => state.account);

  useEffect(() => {
    if (user && !user.accessToken) {
      dispatch(fetchCurrentUser());
      dispatch(getCart());
    }
  }, [dispatch]);

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
