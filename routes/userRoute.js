var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")

router.get("/", userController.loadHome);

router.get("/signup", userController.loadSignUp);

router.get("/login", userController.loadLogin);
 
router.post("/login", userController.login);

router.get("/login-phone",userController.loadLoginPhone);

router.get("/enter-otp",userController.enterOtp)

router.post("/getotp",userController.sendOtpLogin)

router.post("/verify-otp", userController.verifyOtp)

router.post("/signup", userController.RegisterUser);

router.get("/getotp",userController.sendOtpSignup);

router.get("/test",userController.testRender);


module.exports = router;
