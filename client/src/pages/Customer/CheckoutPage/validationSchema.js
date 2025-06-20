import * as yup from 'yup';

// Regex cho số điện thoại Việt Nam
const phoneRegExp = /^(0[3|5|7|8|9])+([0-9]{8})$/;

// Schema tổng hợp cho toàn bộ quá trình checkout
export const checkoutSchema = yup.object().shape({
  fullName: yup.string().required('Vui lòng nhập họ tên'),
  phoneNumber: yup.string().required('Vui lòng nhập số điện thoại').matches(phoneRegExp, 'Số điện thoại không hợp lệ'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  street: yup.string().required('Vui lòng nhập địa chỉ'),
  province: yup.object().required('Vui lòng chọn tỉnh/thành phố'),
  district: yup.object().required('Vui lòng chọn quận/huyện'),
  ward: yup.object().required('Vui lòng chọn phường/xã'),
  note: yup.string().max(500, 'Ghi chú không được vượt quá 500 ký tự')
});
