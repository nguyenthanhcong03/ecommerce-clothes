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

export const convertToTreeSelectFormat = (nodes) => {
  return nodes.map((node) => ({
    title: node.name,
    value: node._id,
    children: node.children && node.children.length > 0 ? convertToTreeSelectFormat(node.children) : undefined
  }));
};

export const formatTreeData = (nodes) => {
  return nodes.map((node) => ({
    ...node,
    children: node.children && node.children.length > 0 ? formatTreeData(node.children) : undefined
  }));
};
