export function findCategoryById(categories, targetId) {
  for (const category of categories) {
    if (category._id === targetId) {
      return category;
    }

    if (category.children) {
      const found = findCategoryById(category.children, targetId);
      if (found) return found;
    }
  }

  return null;
}
