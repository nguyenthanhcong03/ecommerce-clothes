import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import NotPermitted from './NotPermitted';
import Loading from '@/components/common/Loading/Loading';

const RoleBaseRoute = (props) => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const user = useSelector((state) => state.account.user);
  const userRole = user.role;

  if (isAdminRoute && userRole === 'admin') {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedRoute = (props) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.account);

  return (
    <>
      {isAuthenticated === true ? (
        <>
          <RoleBaseRoute>{props.children}</RoleBaseRoute>
        </>
      ) : isLoading ? (
        <Loading />
      ) : (
        <Navigate to='/login' />
      )}
    </>
  );
};

export default ProtectedRoute;
