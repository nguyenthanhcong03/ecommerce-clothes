import mongoose from "mongoose";
import Category from "../models/category.js";

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

export default {
  getProductCountsByCategories,
};
