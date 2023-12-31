var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
const sessionMiddleware = require("../middlewares/sessionMiddleware")
const orderController = require("../controllers/orderController")
const cartController = require("../controllers/cartController")
router.get("/",userController.loadHome);

router.get("/signup", userController.loadSignUp);

router.get("/login", userController.loadLogin);
 
router.post("/login", userController.login); 
  
router.get("/login-phone",userController.loadLoginPhone);

router.get("/enter-otp",userController.enterOtp)

router.post("/getotp",userController.sendOtpLogin)

router.post("/verify-otp", userController.verifyOtp)

router.post("/signup", userController.RegisterUser);
 
router.put("/getotp",userController.sendOtpSignup);

router.post("/search",userController.searchProducts)

router.get("/search",userController.loadSearchProducts)

router.get("/checkout",sessionMiddleware.isLoggedIn,userController.loadCheckout) 

router.post("/add-address",userController.addAddress) 

router.get("/get-address/:ObjectId",userController.getEditAdressData) 

router.post("/submit-address/:ObjectId",userController.submitAddress) 

router.delete("/delete-address",userController.deleteAddress)

router.post("/process-order",orderController.processOrder)

router.get("/order-success/:ObjectId",orderController.loadSuccessPage)

router.get("/order-details", orderController.orderDetail);

router.get("/user-profile",sessionMiddleware.isLoggedIn,userController.userProfile)

router.get("/logout",userController.logout)


router.get("/cancel-order",orderController.cancelOrder)

router.post("/return-order/:ObjectId",orderController.returnOrder)

router.post("/verify-payment/:ObjectId",orderController.verifyPayment)

router.post("/coupon-price",cartController.updateCouponDiscount)

router.post("/remove-coupon",cartController.removeCouponDiscount)

router.get("/referlink",userController.getReferalLink)

router.get("/test",userController.rendertest)


module.exports = router;
