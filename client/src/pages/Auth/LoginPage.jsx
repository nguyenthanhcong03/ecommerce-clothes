import { login } from '@services/authService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { doLoginAction } from '../../redux/features/account/accountSlice';

function LoginPage() {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);

  const dispatch = useDispatch();

  const onFinish = async (values) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await login(username, password);
    setIsSubmit(false);
    if (res?.data) {
      localStorage.setItem('access_token', res.data.access_token);
      dispatch(doLoginAction(res.data.user));
      // message.success('Đăng nhập tài khoản thành công.');
      navigate('/');
    } else {
      // notification.error({
      //   message: "Có lỗi xảy ra."
      //   description:res.message && Array.isArray(res.message) ? res.message[0] : res.message[1]
      //   duration: 5
      // })
    }
  };
  return <div>LoginPage</div>;
}

export default LoginPage;
