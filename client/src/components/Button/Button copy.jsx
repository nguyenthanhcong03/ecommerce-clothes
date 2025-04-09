import React from 'react';
import './button.css';

const Button = ({
  children,
  type, // primary, dashed, link, text, default
  size, // 'small', 'medium', 'large'
  htmlType = 'button', // 'button', 'submit', 'reset'
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button', // 'button', 'submit', 'reset'
  className = '', // Custom classes
  ...rest
}) => {
  return (
    <button {...rest} type={htmlType} className={`button btn-${type}`} disabled={disabled} onClick={onClick}>
      {startIcon && <span className=''>{startIcon}</span>}
      {children}
      {endIcon && <span className=''>{endIcon}</span>}
    </button>
  );
};

export default Button;
