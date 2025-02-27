import React from 'react';

function AboutStory({ title, descriptions, src }) {
  return (
    <div className='mx-auto flex max-w-[1024px] flex-col items-center gap-8 p-5 text-center'>
      <div className='flex flex-col gap-8'>
        <h4 className='text-2xl font-semibold'>{title}</h4>
        <div className='flex flex-col gap-5 text-[clamp(12px,2vw,16px)]'>
          {descriptions.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>
      <div className='h-auto'>
        <img src={src} alt={title} />
      </div>
    </div>
  );
}

export default AboutStory;
