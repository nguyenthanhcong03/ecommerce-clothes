import React, { forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/utils/cn';

// Calendar Icon component for consistent styling
const CalendarIcon = ({ className = '' }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className={cn('h-5 w-5', className)}>
    <path
      fillRule='evenodd'
      d='M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z'
      clipRule='evenodd'
    />
  </svg>
);

// Clock Icon component for time selection
const ClockIcon = ({ className = '' }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className={cn('h-5 w-5', className)}>
    <path
      fillRule='evenodd'
      d='M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z'
      clipRule='evenodd'
    />
  </svg>
);

// Arrow Down Icon for dropdowns
const ArrowDownIcon = ({ className = '' }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className={cn('h-5 w-5', className)}>
    <path
      fillRule='evenodd'
      d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
      clipRule='evenodd'
    />
  </svg>
);

/**
 * Custom DateTimePicker component
 *
 * A modern, accessible date and time picker component with customizable options.
 * Supports separate date and time inputs, custom formatting, min/max dates, and validation.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value (ISO string format)
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onBlur - Blur handler function
 * @param {string} props.label - Input label text
 * @param {string} props.placeholder - Input placeholder text
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.showTime - Whether to show time picker
 * @param {string} props.timeFormat - Time format (12h or 24h)
 * @param {Object} props.error - Error message or object
 * @param {string} props.className - Additional CSS class names
 * @param {string} props.dateMin - Minimum selectable date (YYYY-MM-DD format)
 * @param {string} props.dateMax - Maximum selectable date (YYYY-MM-DD format)
 * @param {React.Ref} ref - Forwarded ref
 */
const DateTimePicker = forwardRef(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      label,
      placeholder = 'Chọn ngày',
      required = false,
      disabled = false,
      showTime = false,
      timeFormat = '24h', // "12h" or "24h"
      error,
      className = '',
      dateMin,
      dateMax
    },
    ref
  ) => {
    const [dateValue, setDateValue] = useState('');
    const [timeValue, setTimeValue] = useState('');
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);

    // Định dạng ngày tháng theo locale cho việc hiển thị
    const formattedDate = useMemo(() => {
      if (!dateValue) return '';

      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';

        // Định dạng ngày tháng theo locale Vietnamese
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }).format(date);
      } catch (error) {
        console.error('Error formatting date for display:', error);
        return '';
      }
    }, [dateValue]);

    // Hàm hỗ trợ format date
    const formatISODate = useCallback((dateString, timeString = '00:00:00') => {
      try {
        // Đảm bảo rằng chúng ta có một chuỗi ngày hợp lệ
        if (!dateString) return null;

        // Tạo một đối tượng date từ ngày và giờ
        const dateTimeString = `${dateString}T${timeString}`;
        const date = new Date(dateTimeString);

        // Kiểm tra tính hợp lệ của date
        if (isNaN(date.getTime())) {
          console.warn('Invalid date created:', dateTimeString);
          return null;
        }

        return date.toISOString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return null;
      }
    }, []);

    // Parse the input value to date and time components
    useEffect(() => {
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            // Format date as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            // Format time as HH:MM
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            setDateValue(formattedDate);
            setTimeValue(formattedTime);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      } else {
        setDateValue('');
        setTimeValue('');
      }
    }, [value]);

    // Handle date change
    const handleDateChange = (e) => {
      const newDateValue = e.target.value;
      setDateValue(newDateValue);
      setTouched(true);

      if (newDateValue) {
        const newTime = showTime && timeValue ? timeValue : '00:00:00';
        const isoValue = formatISODate(newDateValue, newTime);

        // Call the parent onChange with the new value
        if (onChange && isoValue) {
          // Create a proxy event object
          const syntheticEvent = {
            target: {
              name,
              value: isoValue
            }
          };
          onChange(syntheticEvent);
        }
      } else {
        // Clear the value if date is removed
        if (onChange) {
          onChange({ target: { name, value: '' } });
        }
      }
    };

    // Handle time change
    const handleTimeChange = (e) => {
      const newTimeValue = e.target.value;
      setTimeValue(newTimeValue);
      setTouched(true);

      if (dateValue && newTimeValue) {
        const isoValue = formatISODate(dateValue, newTimeValue);

        // Call the parent onChange with the new value
        if (onChange && isoValue) {
          onChange({
            target: {
              name,
              value: isoValue
            }
          });
        }
      }
    };

    // Custom onBlur handler
    const handleBlur = (e) => {
      setTouched(true);
      setFocused(false);
      if (onBlur) {
        onBlur(e);
      }
    };

    // Custom onFocus handler
    const handleFocus = () => {
      setFocused(true);
    };

    // Tạo hint text hiển thị định dạng ngày tháng dễ đọc
    const dateHint = useMemo(() => {
      if (!dateValue || focused) return '';
      return formattedDate;
    }, [dateValue, formattedDate, focused]);

    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={`${name}-date`} className='mb-1.5 block text-sm font-medium text-gray-700'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        )}

        <div className={cn('flex flex-col gap-2', showTime && 'sm:flex-row sm:items-start')}>
          {/* Date picker */}
          <div className='group relative flex-grow'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors duration-200 group-focus-within:text-primaryColor group-hover:text-primaryColor'>
              <CalendarIcon />
            </div>
            <input
              ref={ref}
              id={`${name}-date`}
              name={`${name}-date`}
              type='date'
              value={dateValue}
              onChange={handleDateChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              min={dateMin}
              max={dateMax}
              disabled={disabled}
              className={cn(
                'peer block w-full rounded-md border py-2 pl-10 pr-3 text-sm shadow-sm transition-all duration-200',
                'appearance-none bg-white focus:ring-1 focus:ring-inset',
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 hover:border-gray-400 focus:border-primaryColor focus:ring-primaryColor/20',
                'focus:outline-none',
                disabled ? 'cursor-not-allowed bg-gray-50 text-gray-500 hover:border-gray-300' : '',
                className
              )}
              placeholder={placeholder}
            />
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'>
              <ArrowDownIcon className={cn('transition-transform duration-200', 'peer-focus:rotate-180')} />
            </div>
          </div>

          {/* Time picker (optional) */}
          {showTime && (
            <div className='group relative sm:w-40'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors duration-200 group-focus-within:text-primaryColor group-hover:text-primaryColor'>
                <ClockIcon />
              </div>
              <input
                id={`${name}-time`}
                name={`${name}-time`}
                type='time'
                value={timeValue}
                onChange={handleTimeChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled || !dateValue}
                className={cn(
                  'peer block w-full rounded-md border py-2 pl-10 pr-3 text-sm shadow-sm transition-all duration-200',
                  'appearance-none bg-white focus:ring-1 focus:ring-inset',
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400 focus:border-primaryColor focus:ring-primaryColor/20',
                  'focus:outline-none',
                  disabled || !dateValue ? 'cursor-not-allowed bg-gray-50 text-gray-500 hover:border-gray-300' : '',
                  className
                )}
              />
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'>
                <ArrowDownIcon className={cn('transition-transform duration-200', 'peer-focus:rotate-180')} />
              </div>
            </div>
          )}
        </div>

        {/* Date hint - hiển thị định dạng ngày dễ đọc */}
        {dateHint && !error && (
          <p className='mt-1 text-xs italic text-gray-500 transition-opacity duration-200'>{dateHint}</p>
        )}

        {/* Error message */}
        {error && (
          <p className='mt-1.5 text-sm font-medium text-red-600'>{typeof error === 'string' ? error : error.message}</p>
        )}
      </div>
    );
  }
);

// Theme object - giúp các dự án lớn có thể customize UI dễ dàng bằng cách ghi đè theme mặc định
DateTimePicker.defaultTheme = {
  container: 'w-full',
  label: 'mb-1.5 block text-sm font-medium text-gray-700',
  inputsContainer: 'flex flex-col gap-2',
  inputsFlexRow: 'sm:flex-row sm:items-start',
  inputWrapper: 'relative flex-grow group',
  iconLeft:
    'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-hover:text-primaryColor group-focus-within:text-primaryColor transition-colors duration-200',
  iconRight: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400',
  inputBase:
    'peer block w-full rounded-md border pl-10 pr-3 py-2 text-sm shadow-sm transition-all duration-200 bg-white focus:ring-1 focus:ring-inset appearance-none focus:outline-none',
  inputNormal: 'border-gray-300 hover:border-gray-400 focus:border-primaryColor focus:ring-primaryColor/20',
  inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  inputDisabled: 'bg-gray-50 text-gray-500 cursor-not-allowed hover:border-gray-300',
  hint: 'mt-1 text-xs text-gray-500 italic transition-opacity duration-200',
  errorMessage: 'mt-1.5 text-sm text-red-600 font-medium'
};

// Add displayName for debugging
DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
