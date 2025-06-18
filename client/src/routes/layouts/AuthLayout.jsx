import { Link, Outlet, useLocation } from 'react-router-dom';
import logo from '@/assets/images/outfitory-logo.png';
import Footer from '@/components/layout/Footer/Footer';
import bannerImage from '@/assets/images/banner-ecommerce.jpeg';
import { useEffect } from 'react';
import { sk } from 'date-fns/locale';

const AuthHeader = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  return (
    <header className='h-[80px] border-b bg-white'>
      <div className='container mx-auto flex h-full max-w-[1280px] items-center justify-between px-5'>
        <div className='flex items-center space-x-3'>
          <Link to='/' className='h-full'>
            <img src={logo} alt='Logo' className='h-24 w-auto transition-transform duration-300 hover:scale-110' />
          </Link>
          <span className='text-2xl font-normal'>{isLoginPage ? 'Đăng nhập' : 'Đăng ký'}</span>
        </div>
        <Link to='/help' className='text-sm hover:opacity-90'>
          Bạn cần giúp đỡ?
        </Link>
      </div>
    </header>
  );
};

const AuthFooter = () => (
  <footer className='py-10 text-xs text-[#555555]'>
    <div className='container mx-auto px-4'>
      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-5'>
        <div>
          <h3 className='mb-3 font-semibold uppercase'>DỊCH VỤ KHÁCH HÀNG</h3>
          <ul className='space-y-2'>
            <li>
              <Link to='/help-center'>Trung Tâm Trợ Giúp</Link>
            </li>
            <li>
              <Link to='/blog'>Blog</Link>
            </li>
            <li>
              <Link to='/mall'>Mall</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='mb-3 font-semibold uppercase'>VỀ OUTFITORY</h3>
          <ul className='space-y-2'>
            <li>
              <Link to='/about'>Giới Thiệu</Link>
            </li>
            <li>
              <Link to='/careers'>Tuyển Dụng</Link>
            </li>
            <li>
              <Link to='/terms'>Điều Khoản</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='mb-3 font-semibold uppercase'>THANH TOÁN</h3>
          <div className='grid grid-cols-3 gap-2'>
            <div className='rounded border bg-white p-1'>
              <div className='h-6 w-10 bg-gray-200' />
            </div>
            <div className='rounded border bg-white p-1'>
              <div className='h-6 w-10 bg-gray-200' />
            </div>
            <div className='rounded border bg-white p-1'>
              <div className='h-6 w-10 bg-gray-200' />
            </div>
          </div>
        </div>
        <div>
          <h3 className='mb-3 font-semibold uppercase'>THEO DÕI CHÚNG TÔI</h3>
          <ul className='space-y-2'>
            <li>
              <a href='#' className='hover:text-[#ee4d2d]'>
                Facebook
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-[#ee4d2d]'>
                Instagram
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-[#ee4d2d]'>
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='mb-3 font-semibold uppercase'>TẢI ỨNG DỤNG</h3>
          <div className='grid grid-cols-2 gap-2'>
            <div className='rounded border bg-white p-1'>
              <div className='h-8 w-full bg-gray-200' />
            </div>
            <div className='rounded border bg-white p-1'>
              <div className='h-8 w-full bg-gray-200' />
            </div>
          </div>
        </div>
      </div>
      <div className='border-t pt-8 text-center'>
        © {new Date().getFullYear()} Outfitory. Tất cả các quyền được bảo lưu.
      </div>
    </div>
  </footer>
);

const AuthLayout = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='flex min-h-screen flex-col'>
      <AuthHeader />

      <main className='flex-1 px-4 py-20' style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className='container mx-auto'>
          <div className='mx-auto flex max-w-[1200px] items-center justify-between gap-6'>
            {/* Logo and Slogan */}
            <div className='hidden w-1/2 flex-col items-center text-center text-white md:flex'>
              <div className='group relative flex h-24 w-48 -skew-x-[27deg] transform items-center bg-white/70 shadow-lg transition-all duration-300 hover:h-60 hover:scale-150'>
                <img src={logo} alt='Logo' className='relative h-auto w-96 skew-x-[27deg] drop-shadow-2xl' />
              </div>
              <div className='space-y-6'>
                <h1 className='text-3xl font-bold tracking-wide text-white drop-shadow-lg lg:text-4xl'>
                  Chào mừng đến với
                  <span className='mt-2 block'>Outfitory</span>
                </h1>
                <p className='text-xl font-medium text-white/90 drop-shadow-md lg:text-2xl'>
                  Khám phá các sản phẩm và ưu đãi tuyệt vời
                </p>
              </div>
            </div>
            {/* Auth Form */}
            <div className='w-full rounded bg-white shadow-sm md:w-[500px]'>
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthLayout;
