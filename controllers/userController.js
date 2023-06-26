require("dotenv").config();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const servicesSid = process.env.SERVICES_SID;
const twilio = require("twilio");
const client = twilio(accountSid, authToken);

const loadHome = async function (req, res) {
  try {
    const products = await Product.find()
      .sort({ upload: -1 }) 
      .limit(7);
    res.render("home", { layout: "layouts/user-layout", products: products });
  } catch (err) {
    console.log("Error registering user", err);
  }
};

const loadSignUp = async function (req, res) {
  try {
    res.render("auth/userSignIn");
  } catch (err) {
    console.log("Error loading register", err);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log("Error hashing password", err);
  }
};

const RegisterUser = async function (req, res) {
  try {
    const existingUserEmail = await User.findOne({ email: req.body.email });
    const existingUserPhone = await User.findOne({
      phoneNumber: req.body.countryCode + req.body.phoneNumber,
    });

    if (existingUserEmail) {
      res
        .status(500)
        .json({ error: "This email is already registered. Try a new one." });
    } else if (existingUserPhone) {
      res.status(500).json({
        error: "This mobile number is already registered. Try a new one.",
      });
    } else {
      const hashedPassword = await securePassword(req.body.password);
      const user = new User({
        name: req.body.name,
        phoneNumber: req.body.countryCode + req.body.phoneNumber,
        email: req.body.email,
        password: hashedPassword,
        is_verified: 0,
        is_admin: 0,
        createdAt: Date.now(),
      });

      const userData = await user.save();
      if (userData) {
        sendOtpSignup(req, res).catch((err) => {
          console.log("Error sending OTP", err);
          res
            .status(500)
            .json({ error: "Failed to send OTP. Please try again." });
        });
      } else {
        res.status(500).json({ error: "Sign up failed." });
      }
    }
  } catch (err) {
    console.log("Error in Register User", err);
    res.status(500).json({ error: "Registration failed." });
  }
};

const loaduserOtpVerification = async function (req, res) {
  try {
    res.render("auth/userOtpVerification");
  } catch (err) {
    console.log("error in loading otp input form", err);
  }
};

const sendOtpSignup = async function (req, res) {
  try {
    console.log("send otp function is called..........");
    const phoneNumber = req.body.countryCode + req.body.phoneNumber;
    req.session.phoneNumber = phoneNumber;
    console.log(req.session.phoneNumber + "from the sendOtpSignup");

    // client.verify.v2
    //   .services(servicesSid)
    //   .verifications.create({ to: phoneNumber, channel: "sms" })
    //   .then((verification) => {
    //     console.log(verification.sid);
    //     return true;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return false;
    //   });
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const loadLogin = async function (req, res) {
  try {
    res.render("auth/userLogin");
  } catch (err) {
    console.log("Error in loading login", err);
  }
};

const login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    

    if (!user) {
      return res.render("auth/userLogin", {
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid email or password");
      return res.render("auth/userLogin", {
        message: "Invalid email or password",
      });
    } else {
      console.log("Login successful");
      req.session.user = user
      console.log(req.session.user.id);
      return res.redirect("/");
    }
  } catch (err) {
    console.log("Error in login", err);
  }
};

const loadLoginPhone = async function (req, res) {
  try {
    res.render("auth/userOtpLogin");
  } catch (err) {
    console.log("error in login with phone ", err);
  }
};

const sendOtpLogin = async function (req, res) {
  console.log("send otp function is called..........");
  const phoneNumber = req.body.countryCode + req.body.phoneNumber;
  const user = await User.findOne({ phoneNumber: phoneNumber });
  console.log(user);

  if (!user) {
    return res.render("auth/userOtpLogin", {
      message: "User not found!!",
    });
  }

  req.session.phoneNumber = phoneNumber;
  console.log(req.session.phoneNumber + "from the sendOtpLogin");
  // client.verify.v2
  //   .services(servicesSid)
  //   .verifications.create({ to: phoneNumber, channel: "sms" })
  //   .then((verification) => {
  //     console.log(verification.sid);
  //     return true;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return false;
  //   });
  res.render("auth/userOtpVerification");
};

const verifyOtp = async function (req, res) {
  try {
    const phoneNumber = req.session.phoneNumber;
    const otp = req.body.otp;
    console.log(phoneNumber + " " + otp);
    // client.verify.v2
    //   .services(servicesSid)
    //   .verificationChecks.create({ to: phoneNumber, code: otp })
    //   .then((verification_check) => {
    //     console.log(verification_check.status);
    //     if (verification_check.status === "approved") {
    //       // Redirect to the landing page after OTP is approved
    //       res.redirect("/");

    //     } else {
    //       // Handle the case when OTP is not approved, e.g., render an error page
    //       res.render("auth/userOtpVerification", { message: "Invalid OTP" });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     // Handle the error if needed
    //     res.render("auth/userOtpVerification", {
    //       message: "OTP verification failed",
    //     });
    //   });
  } catch (err) {
    console.log("Error in verifying OTP", err);
    // Handle the error if needed
    res.render("auth/userOtpVerification", { message: "OTP verification failed" });
  }
};

const testRender = async function (req, res) {
  try {
    return res.render("test");
  } catch (err) {
    console.log("Error registering user", err);
  }
};

const viewCart = async function (req, res) {
  try {
    res.render("cart",{ layout: "layouts/user-layout"});
  } catch (err) {
    console.log("error in loading cart", err);
  }
};

module.exports = {
  loadHome,
  loadSignUp,
  loadLogin,
  loadLoginPhone,
  RegisterUser,
  login,
  sendOtpLogin,
  sendOtpSignup,
  verifyOtp,
  testRender,
  viewCart
};
