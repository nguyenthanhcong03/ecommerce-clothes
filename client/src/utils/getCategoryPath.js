// Hàm đệ quy để tìm danh mục và trả về đường dẫn từ gốc đến danh mục đó
export function getCategoryPath(categories, targetId) {
  if (!categories || !targetId) return [];

  for (let category of categories) {
    if (category._id === targetId) {
      return [
        {
          _id: category._id,
          name: category.name,
          slug: category.slug
        }
      ];
    }

    if (category.children) {
      const path = getCategoryPath(category.children, targetId);
      if (path.length > 0) {
        return [
          {
            _id: category._id,
            name: category.name,
            slug: category.slug
          },
          ...path
        ];
      }
    }
  }

  return [];
}
