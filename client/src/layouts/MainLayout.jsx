import React from 'react';
import Header from '../components/Layout/Header/Header';
import Footer from '../components/Layout/Footer/Footer';
import { Outlet, useLocation } from 'react-router-dom';
import SearchModal from '../components/Layout/SearchModal/SearchModal';
import SideBar from '../components/Layout/SideBar/SideBar';
import ProductDetailModal from '../components/product/ProductDetailModal/ProductDetailModal';
import Banner from '@/pages/customer/HomePage/components/Banner/Banner';
import SaleHomePage from '@/pages/customer/HomePage/components/SaleHomePage/SaleHomePage';
import ScrollToTop from '@/components/common/ScrollToTop/ScrollToTop';
import PropTypes from 'prop-types';

function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  return (
    <ScrollToTop>
      <div className='w-full'>
        <SearchModal />
        <SideBar />
        <ProductDetailModal />
        <Header />
        <div className='min-h-screen bg-[#F5F5FA] pb-10'>
          {isHomePage && <Banner />}
          <main className='mx-auto flex max-w-[1280px] flex-col'>
            <Outlet />
          </main>
          {isHomePage && <SaleHomePage />}
        </div>
        <Footer />
      </div>
    </ScrollToTop>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node
};

export default MainLayout;
