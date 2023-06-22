var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.loadHome);

router.get("/signup", userController.loadSignUp);

router.get("/login", userController.loadLogin);
 
router.post("/login", userController.login);

router.get("/login-phone",userController.loadLoginPhone);

router.post("/getotp",userController.sendOtpLogin)

router.post("/verify-otp", userController.verifyOtp)

router.post("/signup", userController.RegisterUser);


router.get("/test",userController.testRender);


module.exports = router;
