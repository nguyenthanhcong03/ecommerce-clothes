// Tạo custom event handler
export const showSessionExpiredModal = () => {
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('show-session-expired-modal'));
};

// Trong axiosConfig.js
const handleSessionExpired = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Trigger custom modal
  showSessionExpiredModal();
};
