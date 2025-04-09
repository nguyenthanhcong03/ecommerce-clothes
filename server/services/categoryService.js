// const Category = require("../models/category");

// const createCategoryService = async (categoryData) => {
//   try {
//     let result = await Category.create({
//       name: categoryData.name,
//       address: categoryData.address,
//       phone: categoryData.phone,
//       email: categoryData.email,
//       desription: categoryData.desription,
//       image: categoryData.image,
//     });
//     return result;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// const createArrayCategoryService = async (arr) => {
//   try {
//     let result = await Category.insertMany(arr);
//     return result;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// module.exports = {
//   createCategoryService,
//   createArrayCategoryService,
// };
