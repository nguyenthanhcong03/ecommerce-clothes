import { ChevronRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

function Breadcrumb({ items }) {
  return (
    <nav className='flex' aria-label='Breadcrumb'>
      <ol className='inline-flex items-center space-x-1 text-sm md:space-x-2'>
        {items.map((item, index) => (
          <li key={index} className='inline-flex items-center'>
            {index > 0 && <ChevronRight className='mx-1 h-4 w-4 text-gray-400 md:mx-2' />}
            {index === items.length - 1 ? (
              <span className='text-gray-500'>{item.label}</span>
            ) : (
              <Link to={item.path} className='hover:text-primary-600 text-gray-700'>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
