import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay tính bằng milliseconds
 * @returns {any} - Giá trị đã được debounce
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Tạo một timeout để cập nhật giá trị debounced sau delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timeout nếu value thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
