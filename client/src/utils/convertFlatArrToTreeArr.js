export const buildTree = (flatArray) => {
  const idToNodeMap = {}; // Map để lưu trữ các node theo id
  const tree = []; // Mảng kết quả (cây cha con)

  // Tạo các node từ mảng phẳng và lưu vào map
  flatArray.forEach((item) => {
    idToNodeMap[item._id] = { ...item, children: [] }; // Thêm trường `children` cho mỗi node
  });

  // Xây dựng cây cha con
  flatArray.forEach((item) => {
    if (item.parentId) {
      // Nếu có `parentId`, thêm node vào `children` của node cha
      idToNodeMap[item.parentId]?.children.push(idToNodeMap[item._id]);
    } else {
      // Nếu không có `parentId`, đây là node gốc
      tree.push(idToNodeMap[item._id]);
    }
  });

  return tree;
};
