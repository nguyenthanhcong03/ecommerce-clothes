import facebookIcon from '@/assets/icons/facebook.png';
import instagramIcon from '@/assets/icons/instagram.png';
import messengerIcon from '@/assets/icons/messenger.png';
import { set } from 'date-fns';
import { Copy, CopyCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const ShareButtons = ({ product }) => {
  const [isCopied, setIsCopied] = useState(false);
  // Lấy URL hiện tại
  const currentUrl = window.location.href;

  // Nếu bạn muốn thêm path cụ thể cho sản phẩm
  const productUrl = `${window.location.origin}/product/${product._id}`;
  console.log('productUrl:', productUrl);
  console.log('product.description:', product.description);

  // Hoặc sử dụng URL hiện tại nếu đang ở trang sản phẩm
  const shareUrl = currentUrl;

  // Hàm chia sẻ qua Facebook
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Hàm chia sẻ qua Instagram (Instagram không hỗ trợ chia sẻ trực tiếp qua URL, chuyển hướng đến trang Instagram)
  const shareOnInstagram = () => {
    const instagramUrl = `https://www.instagram.com/`;
    window.open(instagramUrl, '_blank', 'width=600,height=400');
  };

  // Hàm chia sẻ qua Messenger
  const shareOnMessenger = () => {
    const messengerUrl = `https://www.facebook.com/messenger/send/?link=${encodeURIComponent(productUrl)}&app_id=YOUR_APP_ID`;
    window.open(messengerUrl, '_blank', 'width=600,height=400');
  };

  // Copy link sản phẩm
  const copyProductLink = () => {
    navigator.clipboard.writeText(productUrl);
    setIsCopied(true);
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-gray-600'>Chia sẻ:</span>
      <div className='flex items-center gap-1'>
        <button onClick={shareOnFacebook} className='rounded-full p-2 transition-colors hover:bg-blue-50'>
          <img src={facebookIcon} alt='Facebook' className='h-5 w-5' />
        </button>
        <button onClick={shareOnInstagram} className='rounded-full p-2 transition-colors hover:bg-pink-50'>
          <img src={instagramIcon} alt='Instagram' className='h-5 w-5' />
        </button>
        <button onClick={shareOnMessenger} className='rounded-full p-2 transition-colors hover:bg-blue-50'>
          <img src={messengerIcon} alt='Messenger' className='h-5 w-5' />
        </button>
        {/* Copy link */}
        {/* <div className=''> */}
        {/* <input
            type='text'
            value={productUrl}
            readOnly
            className='rounded-l-md border border-gray-300 p-2 focus:outline-none'
          /> */}
        <button
          onClick={copyProductLink}
          className='ml-2 flex items-center text-[#333] transition-colors hover:text-blue-500'
        >
          {isCopied ? <CopyCheck /> : <Copy />}
        </button>
        {/* </div> */}
      </div>
    </div>
  );
};
export default ShareButtons;
