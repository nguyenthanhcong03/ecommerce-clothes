const Category = require("../models/category");
const mongoose = require("mongoose");
const { deleteFile, deleteMultipleFiles } = require("./fileService");
const slugify = require("slugify");

const getCategories = async (options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", search, parentId } = options;

    // Build query
    let query = {};

    if (parentId !== undefined) {
      query.parentId = parentId === "null" ? null : parentId;
    }

    // Search by name or description
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    // Count total documents
    const total = await Category.countDocuments(query);

    // Get categories with pagination and sorting
    const categories = await Category.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v");

    return {
      categories,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error getting categories: ${error.message}`);
  }
};

const getCategoryTree = async (onlyActive = true) => {
  try {
    // Fetch all categories or only active ones
    const query = onlyActive ? { isActive: true } : {};
    const categories = await Category.find(query).sort({ priority: -1 });

    // Create a map for quick lookup
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = {
        ...category.toObject(),
        children: [],
      };
    });

    // Build the tree
    const rootCategories = [];
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap[category._id];

      if (category.parentId && categoryMap[category.parentId]) {
        // Add to parent's children if parent exists
        categoryMap[category.parentId].children.push(categoryWithChildren);
      } else {
        // Add to root if no parent or parent doesn't exist
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  } catch (error) {
    throw new Error(`Error getting category tree: ${error.message}`);
  }
};

const hasChildCategories = async (categoryId) => {
  try {
    const count = await Category.countDocuments({ parentId: categoryId });
    return count > 0;
  } catch (error) {
    throw new Error(`Error checking for child categories: ${error.message}`);
  }
};

const hasProducts = async (categoryId) => {
  try {
    const Product = mongoose.model("Product");
    const count = await Product.countDocuments({ categoryId });
    return count > 0;
  } catch (error) {
    throw new Error(`Error checking for products in category: ${error.message}`);
  }
};

const getProductCountsByCategories = async (categoryIds = []) => {
  try {
    const Product = mongoose.model("Product");

    if (!categoryIds.length) {
      // If no specific IDs provided, get counts for all categories
      const categories = await Category.find({}, "_id");
      categoryIds = categories.map((cat) => cat._id);
    }

    const pipeline = [
      { $match: { categoryId: { $in: categoryIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ];

    const results = await Product.aggregate(pipeline);

    // Convert to object for easier lookup
    const countsMap = {};
    results.forEach((result) => {
      countsMap[result._id] = result.count;
    });

    // Ensure all requested categories have a count (even if 0)
    const finalCountsMap = {};
    categoryIds.forEach((id) => {
      finalCountsMap[id] = countsMap[id] || 0;
    });

    return finalCountsMap;
  } catch (error) {
    throw new Error(`Error getting product counts: ${error.message}`);
  }
};

const deleteCategory = async (categoryId) => {
  try {
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Delete category images from Cloudinary if they have public_id
    if (category.images && category.images.length > 0) {
      const imagesToDelete = category.images.filter((img) => img.public_id);
      if (imagesToDelete.length > 0) {
        await deleteMultipleFiles(imagesToDelete);
      }
    }

    // Remove the category
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    return deletedCategory;
  } catch (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

const createCategory = async (categoryData) => {
  try {
    const { name, parentId, description, priority, images } = categoryData;

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    // Check if category with slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new Error("Danh mục với tên này đã tồn tại");
    }

    // Validate parent ID if provided
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      const parentExists = await Category.exists({ _id: parentId });
      if (!parentExists) {
        throw new Error("Danh mục cha không tồn tại");
      }
    }

    // Create new category
    const newCategory = new Category({
      name,
      slug,
      parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
      description,
      images: images,
      priority: priority || 0,
    });

    // Save to database
    const savedCategory = await newCategory.save();

    return savedCategory;
  } catch (error) {
    // Handle duplicate key error specially
    if (error.code === 11000) {
      throw new Error("Danh mục với tên này đã tồn tại");
    }
    throw new Error(`Failed to create category: ${error.message}`);
  }
};

const getCategoryById = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw new Error(`Error fetching category: ${error.message}`);
  }
};

const updateCategory = async (categoryId, updateData) => {
  try {
    const { name, parentId, description, priority, images } = updateData;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    // Prepare data for update
    const dataToUpdate = {};

    if (name && name !== category.name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = slugify(name.trim(), { lower: true, strict: true, locale: "vi" });

      // Check if the new slug would create a duplicate
      const duplicateCheck = await Category.findOne({
        slug: dataToUpdate.slug,
        _id: { $ne: categoryId }, // Exclude current category
      });

      if (duplicateCheck) {
        throw new Error("Danh mục với tên này đã tồn tại");
      }
    }

    if (description !== undefined) dataToUpdate.description = description;
    if (priority !== undefined) dataToUpdate.priority = priority;

    // Handle new images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      // Add new images to existing ones
      dataToUpdate.images = images;
    }

    // Handle parentId update with validation
    if (parentId !== undefined) {
      // Can't set category as its own parent
      if (parentId === categoryId) {
        throw new Error("Không thể đặt danh mục làm cha của chính nó");
      }

      // Validate parent ID if not null
      if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
        const parentExists = await Category.exists({ _id: parentId });
        if (!parentExists) {
          throw new Error("Danh mục cha không tồn tại");
        }

        // Prevent cyclic parent relationships
        let currentParent = parentId;
        while (currentParent) {
          if (currentParent.toString() === categoryId) {
            throw new Error("Thao tác này sẽ tạo ra chu trình trong cấu trúc phân cấp danh mục");
          }
          const parent = await Category.findById(currentParent, "parentId");
          if (!parent) break;
          currentParent = parent.parentId;
        }

        dataToUpdate.parentId = parentId;
      } else {
        dataToUpdate.parentId = null;
      }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, dataToUpdate, { new: true });
    return updatedCategory;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Danh mục với tên này đã tồn tại");
    }
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  hasChildCategories,
  hasProducts,
  getProductCountsByCategories,
  deleteCategory,
  createCategory,
  getCategoryById,
  updateCategory,
};
