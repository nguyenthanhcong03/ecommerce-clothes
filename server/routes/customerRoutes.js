const router = require("express").Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.postCreateCustomer);
router.post("/many", customerController.postCreateArrayCustomer);

module.exports = router;
