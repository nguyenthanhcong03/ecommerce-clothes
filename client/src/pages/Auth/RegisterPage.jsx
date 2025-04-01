import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const onFinish = async (values) => {
    const { username, password, email, firstName, lastName } = values;
    setIsSubmit(true);
    const res = await register(username, password, email, firstName, lastName);
    setIsSubmit(false);
    if (res?.data?._id) {
      // message.success('Đăng ký tài khoản thành công.');
      navigate('/login');
    } else {
      // notification.error({
      //   message: "Có lỗi xảy ra."
      //   description:res.message && Array.isArray(res.message) ? res.message[0] : res.message[1]
      //   duration: 5
      // })
    }
  };
  return (
    <div className='w-full pt-[60px] lg:pt-[80px]'>
      <div className='flex h-[50px] max-h-[100px] w-full items-center justify-center bg-[#FAFAFA] sm:h-[60px] md:h-[80px] lg:h-[90px] xl:h-[100px]'>
        <div className='text-[24px]'>SIGN UP</div>
      </div>
    </div>
  );
};

export default RegisterPage;
