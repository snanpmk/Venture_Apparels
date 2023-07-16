var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
const sessionMiddleware = require("../middlewares/sessionMiddleware")


router.get("/",userController.loadHome);

router.get("/signup", userController.loadSignUp);

router.get("/login", userController.loadLogin);
 
router.post("/login", userController.login); 
  
router.get("/login-phone",userController.loadLoginPhone);

router.get("/enter-otp",userController.enterOtp)

router.post("/getotp",userController.sendOtpLogin)

router.post("/verify-otp", userController.verifyOtp)

router.post("/signup", userController.RegisterUser);
 
router.get("/getotp",userController.sendOtpSignup);

router.post("/search",userController.searchProducts)

router.get("/search",userController.loadSearchProducts)

router.get("/checkout",sessionMiddleware.isLoggedIn,userController.loadCheckout) 

router.post("/add-address",userController.addAddress) 

router.get("/edit-address",userController.addAddress) 

router.post("/edit-address/:ObjectId",userController.getEditAdressData) 



module.exports = router;
