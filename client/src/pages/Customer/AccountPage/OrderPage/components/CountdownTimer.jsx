import { Timer } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

const CountdownTimer = ({ createdAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    // Reset notification flag khi createdAt thay đổi
    hasNotifiedRef.current = false;
    setIsExpired(false);

    const calculateTimeLeft = () => {
      const orderTime = new Date(createdAt).getTime();
      const expiryTime = orderTime + 60 * 60 * 1000; // 1 giờ = 60 phút * 60 giây * 1000ms
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });

        // Chỉ gọi onExpired một lần duy nhất
        if (onExpired && !hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onExpired();
        }
        return null;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    }; // Tính toán thời gian ban đầu
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    // Nếu đã hết hạn từ đầu, không cần tạo interval
    if (initialTime === null) {
      return;
    }

    // Tạo interval để cập nhật mỗi giây
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      // Dừng interval khi hết hạn
      if (!newTime) {
        clearInterval(timer);
      }
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(timer);
  }, [createdAt, onExpired]);

  if (!timeLeft) return null;

  const getTimeColor = () => {
    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes <= 10) return 'text-red-600 bg-red-50'; // Dưới 10 phút - đỏ
    if (totalMinutes <= 30) return 'text-orange-600 bg-orange-50'; // Dưới 30 phút - cam
    return 'text-blue-600 bg-blue-50'; // Trên 30 phút - xanh
  };

  return (
    <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getTimeColor()}`}>
      <Timer className='mr-1 h-3 w-3' />
      {isExpired ? (
        <span>Đã hết hạn</span>
      ) : (
        <span>
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      )}
    </div>
  );
};

export default CountdownTimer;
