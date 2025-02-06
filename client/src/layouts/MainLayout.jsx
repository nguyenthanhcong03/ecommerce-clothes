import React from 'react';
import Header from '../components/Layout/Header/Header';
import Footer from '../components/Layout/Footer/Footer';
import { Outlet } from 'react-router-dom';

function MainLayout({ children }) {
  return (
    <div className='w-full'>
      <Header />
      {/* Main Content  */}
      <main className='mx-auto flex max-w-[1536px] flex-col'>
        <Outlet />
        {/* <div className=''>{children}</div> */}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
