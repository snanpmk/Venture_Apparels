var express = require("express");
var router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/view",cartController.viewCart);

router.get("/add/:ObjectId",cartController.addToCart);

module.exports = router;
