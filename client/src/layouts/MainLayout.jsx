import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

function MainLayout({ children }) {
  return (
    <div className='w-full'>
      <Header />
      {/* Main Content  */}
      <div className='mx-auto flex max-w-[1536px] flex-col'>
        <div className=''>{children}</div>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;
