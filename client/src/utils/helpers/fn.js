export const removeSpecialCharacter = (str) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '');

export const generateNameId = ({ name, id }) => {
  return removeSpecialCharacter(name).replace(/\s+/g, '-') + `-i,${id}`;
};

export const getIdFromNameId = (nameId) => {
  if (typeof nameId !== 'string') {
    return '';
  }
  const arr = nameId.split('-i,');
  return arr[arr.length - 1];
};

export const getPaymentMethodText = (method) => {
  switch (method) {
    case 'VNPay':
      return 'Thanh toán trực tuyến qua VNPay';
    case 'Momo':
      return 'Thanh toán trực tuyến qua Ví MoMo';
    case 'COD':
      return 'Thanh toán khi nhận hàng (COD)';
    default:
      return method;
  }
};
