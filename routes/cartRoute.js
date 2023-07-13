var express = require("express");
var router = express.Router();
const cartController = require("../controllers/cartController");
const sessionMiddleware = require("../middlewares/sessionMiddleware")

router.get("/view",sessionMiddleware.isLoggedIn,cartController.viewCart);

router.get("/add/:ObjectId",sessionMiddleware.isLoggedIn,cartController.addToCart);

router.post("/update-quantity/:ObjectId",cartController.updateQuantity)

module.exports = router;