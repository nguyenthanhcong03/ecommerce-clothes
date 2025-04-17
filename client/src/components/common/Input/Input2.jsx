const Input2 = ({
  label,
  id,
  type = 'text',
  register,
  name,
  error,
  placeholder,
  disabled = false,
  className = '',
  ...rest
}) => {
  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={id} className='mb-1 block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        {...(register && register(name))} // Hỗ trợ react-hook-form
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'} ${className} `}
        {...rest}
      />
      {error && <p className='mt-1 text-sm text-red-600'>{error.message}</p>}
    </div>
  );
};

export default Input2;
