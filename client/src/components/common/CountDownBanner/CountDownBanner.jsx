import CountdownTimer from './CountDownTimer';
import countdownBanner2 from '@/assets/images/countdownBanner2.jpeg';

function CountDownBanner({ bannerImage = countdownBanner2 }) {
  const targetDate = '2025-12-31T00:00:00';
  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center gap-5 rounded-sm border bg-cover bg-center bg-no-repeat p-5'
      style={{
        backgroundImage: `url(${bannerImage})`
      }}
    >
      <div className='flex items-center justify-center gap-[10px]'>
        <CountdownTimer targetDate={targetDate} />
      </div>
      <p className='text-center text-[28px] text-primaryColor'>Phong cách cổ điển đang quay trở lại</p>
    </div>
  );
}

export default CountDownBanner;
