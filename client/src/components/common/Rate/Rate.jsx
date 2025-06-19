import { Star } from 'lucide-react';
import { useState } from 'react';

const Rate = ({ totalStars = 5, value = 0, onChange, disabled = false, size = 24 }) => {
  const [hovered, setHovered] = useState(null);

  const handleClick = (starValue) => {
    if (disabled) return;
    if (value === starValue) {
      onChange?.(0); // Click lại để bỏ chọn
    } else {
      onChange?.(starValue); // Chọn sao
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!disabled) setHovered(starValue);
  };

  const handleMouseLeave = () => {
    if (!disabled) setHovered(null);
  };

  return (
    <div className='flex'>
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = hovered ? starValue <= hovered : starValue <= value;

        return (
          <div
            key={index}
            className={`transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <Star fill={isFilled ? '#ffc107' : '#e4e5e9'} strokeWidth={0} size={size} />
          </div>
        );
      })}
    </div>
  );
};

export default Rate;
