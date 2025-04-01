import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleBaseRoute = (props) => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const user = useSelector((state) => state.account.user);
  const userRole = user.role;

  if (isAdminRoute && userRole !== 'admin') {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedRoute = (props) => {
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  return (
    <>
      {isAuthenticated === true ? (
        <>
          <RoleBaseRoute>{props.children}</RoleBaseRoute>
        </>
      ) : (
        <Navigate to='/login' replacr />
      )}
    </>
  );
};

export default ProtectedRoute;
