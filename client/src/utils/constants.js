import { Truck, MessageCircle, RefreshCcw, CreditCard } from 'lucide-react';
export const SHOP_NAME = 'Outfitory';
export const SHOP_ADDRESS = '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội';
export const SHOP_PHONE = '0373702309';
export const SHOP_EMAIL = 'nguyenthanhcong03@hotmail.com';
export const COLOR_OPTIONS = [
  { name: 'Đen', hex: '#000000' },
  { name: 'Trắng', hex: '#FFFFFF' },
  { name: 'Xám', hex: '#808080' },
  { name: 'Xanh dương', hex: '#007BFF' },
  { name: 'Xanh lá', hex: '#28a745' },
  { name: 'Đỏ', hex: '#dc3545' },
  { name: 'Vàng', hex: '#ffc107' },
  { name: 'Hồng', hex: '#e83e8c' },
  { name: 'Nâu', hex: '#8B4513' },
  { name: 'Be', hex: '#f5f5dc' },
  { name: 'Cam', hex: '#fd7e14' },
  { name: 'Tím', hex: '#6f42c1' }
];
export const SIZE_OPTIONS = [
  { name: 'S', value: 'S' },
  { name: 'M', value: 'M' },
  { name: 'L', value: 'L' },
  { name: 'XL', value: 'XL' },
  { name: 'XXL', value: 'XXL' }
];

export const POLICIES = [
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn hàng từ 99.000đ'
  },
  {
    icon: RefreshCcw,
    title: 'Hoàn trả hàng',
    subtitle: 'Trong 14 ngày'
  },
  {
    icon: CreditCard,
    title: 'Thanh toán 100% an toàn',
    subtitle: 'Mua sắm an tâm'
  },
  {
    icon: MessageCircle,
    title: 'Hỗ trợ trực tuyến 24/7',
    subtitle: 'Giao hàng tận nhà'
  }
];
