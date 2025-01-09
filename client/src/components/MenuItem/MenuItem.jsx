import React from 'react';
import { Link } from 'react-router-dom';

function MenuItem({ href, text }) {
  return (
    <Link to={href}>
      <div className='relative cursor-pointer pt-[3px]'>
        <span className='mt-[6px] after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:transition-opacity after:transition-transform after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'>
          {text}
        </span>
      </div>
    </Link>
  );
}

export default MenuItem;
