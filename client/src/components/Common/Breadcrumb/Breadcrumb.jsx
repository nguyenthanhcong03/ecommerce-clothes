import React from 'react';

function Breadcrumb({ items }) {
  return (
    <nav className='text-sm'>
      {items.map((item, index) => (
        <span key={index}>
          {index !== 0 && ' > '}
          {item.link ? (
            <a href={item.link} className='text-thirdColor no-underline'>
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
