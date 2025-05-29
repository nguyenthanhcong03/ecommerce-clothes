export const formatTree = (tree) => {
  return tree.map((node) => ({
    title: node.name,
    value: node._id,
    children: node.children && node.children.length > 0 ? formatTree(node.children) : []
  }));
};
