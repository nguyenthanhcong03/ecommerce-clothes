import bannerImage from '@/assets/images/banner-ecommerce.jpeg';
import Logo from '@/assets/images/outfitory-logo.png';
import Button from '@/components/common/Button/Button';
import { Link } from 'react-router-dom';

function Banner() {
  return (
    <div
      className='flex min-h-[750px] w-full items-center justify-center bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className='container mx-auto flex flex-col items-center justify-center gap-5'>
        <img src={Logo} alt='Logo' className='h-[150px] transition-transform duration-300 hover:scale-125' />
        <div className='mx-5 mb-4 text-center leading-[24px] text-primaryColor'>
          Hãy biến những ngày kỷ niệm của bạn trở nên đặc biệt hơn với vẻ đẹp tinh tế.
        </div>
        <Link to={'/shop'}>
          <Button>Mua ngay</Button>
        </Link>
      </div>
    </div>
  );
}

export default Banner;
