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

export const CLOTHING_SIZE_OPTIONS = [
  { name: 'S', value: 'S' },
  { name: 'M', value: 'M' },
  { name: 'L', value: 'L' },
  { name: 'XL', value: 'XL' },
  { name: 'XXL', value: 'XXL' }
];

export const PANTS_SIZE_OPTIONS = [
  { name: '28', value: '28' },
  { name: '29', value: '29' },
  { name: '30', value: '30' },
  { name: '31', value: '31' },
  { name: '32', value: '32' },
  { name: '33', value: '33' },
  { name: '34', value: '34' },
  { name: '35', value: '35' },
  { name: '36', value: '36' },
  { name: '38', value: '38' },
  { name: '40', value: '40' }
];

export const PRODUCT_TYPE_OPTIONS = [
  { name: 'Áo', value: 'clothing' },
  { name: 'Quần', value: 'pants' }
];

export const SIZE_OPTIONS = CLOTHING_SIZE_OPTIONS;

export const PRICE_RANGES = [
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100.000đ - 300.000đ', min: 100000, max: 300000 },
  { label: '300.000đ - 500.000đ', min: 300000, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: null }
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
