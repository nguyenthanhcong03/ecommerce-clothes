import React from 'react';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/Layout/Footer/Footer';
import { Outlet, useLocation } from 'react-router-dom';
import SearchModal from '@/components/Layout/SearchModal/SearchModal';
import SideBar from '@/components/Layout/SideBar/SideBar';
import ProductDetailModal from '@/components/product/ProductDetailModal/ProductDetailModal';
import Banner from '@/pages/customer/HomePage/components/Banner';
import SaleHomePage from '@/pages/customer/HomePage/components/SaleHomePage';
import ScrollToTop from '@/components/common/ScrollToTop/ScrollToTop';
import PropTypes from 'prop-types';
import { POLICIES } from '@/utils/constants';

function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  return (
    <ScrollToTop>
      <div className='w-full'>
        <SearchModal />
        <SideBar />
        <ProductDetailModal />
        <Header />
        <div className={`bg-[#F5F5FA] pb-10 ${isLoginPage || isRegisterPage ? '' : 'min-h-screen'}`}>
          {isHomePage && <Banner />}
          <main className='mx-auto flex max-w-[1280px] flex-col px-5'>
            <Outlet />
          </main>
          {(isLoginPage || isRegisterPage) && (
            <div className='px-4 py-6'>
              <div className='mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4'>
                {POLICIES.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className='flex items-center gap-6 rounded-sm border border-gray-200 bg-white p-4 shadow-sm'
                    >
                      <Icon strokeWidth={1} className='h-10 w-10 text-black' />
                      <div className='items- flex flex-col justify-center'>
                        <p className='text-base font-medium text-gray-800'>{item.title}</p>
                        {item.subtitle && <p className='text-sm text-gray-600'>{item.subtitle}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
