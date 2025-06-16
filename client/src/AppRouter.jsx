import { fetchCurrentUser } from '@/store/slices/accountSlice.js';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes.jsx';
import { getCart } from '@/store/slices/cartSlice.js';
import { toast } from 'react-toastify';

function AppRouter() {
  const { isLoading, isAuthenticated, error, user } = useSelector((state) => state.account);
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  // setNavigate(navigate);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // get cart
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [isAuthenticated, dispatch]);

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-white'>
        <div className='h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-primaryColor'></div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default AppRouter;
