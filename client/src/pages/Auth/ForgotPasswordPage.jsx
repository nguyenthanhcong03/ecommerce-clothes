import React, { useEffect } from 'react';

const ForgotPasswordPage = () => {
  useEffect(() => {
    document.title = 'Quên mật khẩu | Outfitory';
  }, []);
  return <div>ForgotPasswordPage</div>;
};

export default ForgotPasswordPage;
