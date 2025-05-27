import React, { useState, useEffect } from 'react';

const SessionExpiredModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsVisible(true);
    };

    window.addEventListener('show-session-expired-modal', handleSessionExpired);

    return () => {
      window.removeEventListener('show-session-expired-modal', handleSessionExpired);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    window.location.href = '/login';
  };

  if (!isVisible) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <h3>Phiên đăng nhập hết hạn</h3>
        <p>Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.</p>
        <button onClick={handleClose}>Đăng nhập lại</button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
