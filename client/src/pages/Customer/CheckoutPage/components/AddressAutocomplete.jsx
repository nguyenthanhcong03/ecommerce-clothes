import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { getAddressSuggestions } from '../../../../services/mapService';

const AddressAutocomplete = forwardRef(
  ({ label, placeholder, required = false, onChange, onBlur, value, name, error }, ref) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const suggestionRef = useRef(null);

    // Cập nhật query khi value thay đổi từ bên ngoài
    useEffect(() => {
      if (value !== undefined && value !== query) {
        setQuery(value);
      }
    }, [value]);

    useEffect(() => {
      // Xử lý click bên ngoài để đóng gợi ý
      const handleClickOutside = (event) => {
        if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    useEffect(() => {
      const fetchSuggestions = async () => {
        if (query?.length < 3) {
          setSuggestions([]);
          return;
        }

        setLoading(true);
        try {
          const results = await getAddressSuggestions(query);
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
        } finally {
          setLoading(false);
        }
      };

      const delayDebounce = setTimeout(fetchSuggestions, 500);
      return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleSelectSuggestion = (suggestion) => {
      const selectedAddress = suggestion.place_name;
      setQuery(selectedAddress);
      setShowSuggestions(false);

      // Gọi callback onChange với địa chỉ được chọn
      if (onChange) {
        onChange(selectedAddress, suggestion);
      }
    };

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setQuery(newValue);
      setShowSuggestions(true);

      // Gọi callback onChange khi người dùng nhập
      if (onChange) {
        onChange(newValue);
      }
    };

    return (
      <div className='relative w-full'>
        <div className='relative'>
          {label && (
            <label htmlFor={name} className='mb-1 block text-sm font-medium'>
              {label} {required && <span className='text-red-500'>*</span>}
            </label>
          )}

          <div ref={suggestionRef} className='relative w-full'>
            <div className='relative'>
              <input
                ref={ref}
                type='text'
                id={name}
                name={name}
                className={`w-full rounded-sm border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } p-2 px-3 text-sm focus:border-primaryColor focus:outline-none`}
                placeholder={placeholder || 'Nhập địa chỉ'}
                value={query || ''}
                onChange={handleInputChange}
                onBlur={onBlur}
                onFocus={() => setShowSuggestions(true)}
              />

              {loading && (
                <div className='absolute right-3 top-2'>
                  <svg
                    className='h-5 w-5 animate-spin text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                </div>
              )}
            </div>

            {showSuggestions && suggestions?.length > 0 && (
              <div className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm bg-white py-1 shadow-lg'>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion.place_name}
                  </div>
                ))}
              </div>
            )}

            {error && <p className='mt-1 text-xs text-red-500'>{typeof error === 'string' ? error : error?.message}</p>}
          </div>
        </div>
      </div>
    );
  }
);

// Thêm displayName để dễ debug
AddressAutocomplete.displayName = 'AddressAutocomplete';

export default AddressAutocomplete;
