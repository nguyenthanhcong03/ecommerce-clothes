import React from 'react';
import Header from '../components/Layout/Header/Header';
import Footer from '../components/Layout/Footer/Footer';
import { Outlet } from 'react-router-dom';
import SearchModal from '../components/Layout/SearchModal/SearchModal';
import SideBar from '../components/Layout/SideBar/SideBar';
import ProductDetailModal from '../components/product/ProductDetailModal/ProductDetailModal';

function MainLayout({ children }) {
  return (
    <div className='w-full'>
      <SearchModal />
      <SideBar />
      <ProductDetailModal />
      <Header />
      {/* Main Content  */}
      <main className='mx-auto flex flex-col'>
        <Outlet />
        {/* <div className=''>{children}</div> */}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
