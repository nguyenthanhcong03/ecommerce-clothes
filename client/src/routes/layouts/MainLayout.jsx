import ChatBot from '@/components/common/ChatBot/ChatBot';
import ScrollToTop from '@/components/common/ScrollToTop/ScrollToTop';
import Footer from '@/components/Layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import SearchModal from '@/components/Layout/SearchModal/SearchModal';
import SideBar from '@/components/Layout/SideBar/SideBar';
import ProductDetailModal from '@/components/product/ProductDetailModal/ProductDetailModal';
import Banner from '@/pages/customer/HomePage/components/Banner';
import SaleHomePage from '@/pages/customer/HomePage/components/SaleHomePage';
import PropTypes from 'prop-types';
import { Outlet, useLocation } from 'react-router-dom';

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
          {isHomePage && <SaleHomePage />}
        </div>
        <Footer />
        <ChatBot />
      </div>
    </ScrollToTop>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node
};

export default MainLayout;
