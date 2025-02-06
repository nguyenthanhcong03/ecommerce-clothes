import React from 'react';

function Headline({ text1, text2 }) {
  return (
    <div className='container mx-auto flex max-w-[1280px] flex-col items-center justify-center'>
      <span className='text-sm uppercase text-thirdColor'>{text1}</span>
      <h2 className='flex w-full items-center justify-center whitespace-nowrap text-2xl font-normal leading-8 text-primaryColor before:mr-[50px] before:block before:h-[4px] before:w-full before:border-b-[2px] before:border-t-[2px] before:border-[#e1e1e1] before:content-[""] after:ml-[50px] after:block after:h-[4px] after:w-full after:border-b-[2px] after:border-t-[2px] after:border-[#e1e1e1] after:content-[""]'>
        {text2}
      </h2>
    </div>
  );
}

export default Headline;
