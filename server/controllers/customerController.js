const User = require("../models/user");
const { createCustomerService } = require("../services/customerService");
const { uploadSingleFile, uploadMultipleFiles } = require("../services/fileService");

const postCreateCustomer = async (req, res) => {
  let { name, address, phone, email, desription } = req.body;
  let imageUrl = "";
  if (!req.files || Object.keys(req.files).length === 0) {
    // do nothing
  } else {
    let result = await uploadSingleFile(req.files.image);
    imageUrl = result.path;
  }
  let customerData = {
    name,
    address,
    phone,
    email,
    desription,
    image: imageUrl,
  };
  let customer = await createCustomerService(customerData);

  return res.status(200).json({
    EC: 1,
    data: customer,
  });
};

const postCreateArrayCustomer = async (req, res) => {
  let customers = await createArrayCustomerService(req.body.customers);
  return res.status(200).json({
    EC: 1,
    data: customers,
  });
};

module.exports = { postCreateCustomer, postCreateArrayCustomer };
