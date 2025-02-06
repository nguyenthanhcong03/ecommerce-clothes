import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import SideBar from './components/Layout/SideBar/SideBar';
import { SideBarProvider } from './contexts/SideBarProvider';
import MainLayout from './layouts/MainLayout';
import AboutPage from './pages/AboutPage/AboutPage';
import HomePage from './pages/HomePage/HomePage';
import OurShopPage from './pages/OurShopPage/OurShopPage';
import NewsPage from './pages/NewsPage/NewsPage';
import ContactPage from './pages/ContactPage/ContactPage';

// const Home = lazy(() => import('../pages/Home/Home'));
// const ProductDetail = lazy(() => import('../pages/Product/ProductDetail'));
// const Cart = lazy(() => import('../pages/Cart/Cart'));
// const Login = lazy(() => import('../pages/Auth/Login'));
// const Register = lazy(() => import('../pages/Auth/Register'));
// const NotFound = lazy(() => import('../pages/NotFound'));

function App() {
  return (
    <SideBarProvider>
      <Router>
        <SideBar />
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/shop' element={<OurShopPage />} />
            <Route path='/news' element={<NewsPage />} />
            <Route path='/contact' element={<ContactPage />} />
          </Route>
        </Routes>
      </Router>
    </SideBarProvider>
  );
}

export default App;
