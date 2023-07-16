require("dotenv").config();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const servicesSid = process.env.SERVICES_SID;
const twilio = require("twilio");
const client = twilio(accountSid, authToken);
const Address = require("../models/addressSchema");
const Cart = require("../models/cartModel");

// load user landing page
const loadHome = async function (req, res) {
  try {
    const products = await Product.find().sort({ upload: -1 }).limit(7);
    res.render("home", { layout: "layouts/userLayout", products: products });
  } catch (err) {
    console.log("Error registering user", err);
  }
};

// load user signup
const loadSignUp = async function (req, res) {
  try {
    res.render("auth/userSignIn");
  } catch (err) {
    console.log("Error loading register", err);
  }
};

// hashing password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log("Error hashing password", err);
  }
};

// user Sign up
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

// send otp while signup
const sendOtpSignup = async function (req, res) {
  try {
    console.log("send otp function is called..........");
    const phoneNumber = req.body.countryCode + req.body.phoneNumber;
    req.session.phoneNumber = phoneNumber;
    console.log(req.session.phoneNumber + "from the sendOtpSignup");

    client.verify.v2
      .services(servicesSid)
      .verifications.create({ to: phoneNumber, channel: "sms" })
      .then((verification) => {
        console.log(verification.sid);
        return true;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// load user login page
const loadLogin = async function (req, res) {
  try {
    res.render("auth/userLogin");
  } catch (err) {
    console.log("Error in loading login", err);
  }
};

// verifying login using email and password
const login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(500).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(500).json({ error: "Incorrect password" });
    } else {
      if (user && user.id) {
        req.session.userId = user.id;
        req.session.userloggedIn = true;
        console.log(req.session.userId);
      }
      res
        .status(200)
        .json({ success: true, message: "logged in successfully" });
    }
  } catch (err) {
    console.log("Error in login", err);
  }
};

// load users login with phonenumber
const loadLoginPhone = async function (req, res) {
  try {
    res.render("auth/userOtpLogin");
  } catch (err) {
    console.log("error in login with phone ", err);
  }
};

// sending otp while login
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
  client.verify.v2
    .services(servicesSid)
    .verifications.create({ to: phoneNumber, channel: "sms" })
    .then((verification) => {
      console.log(verification.sid);
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
  res.render("auth/userOtpVerification");
};

// load the otp entering page
const enterOtp = async function (req, res) {
  try {
    res.render("auth/userOtpVerification");
  } catch (err) {
    console.log("error in loading otp input form", err);
  }
};

// verifying the otp
const verifyOtp = async function (req, res) {
  try {
    const phoneNumber = req.session.phoneNumber;
    const otp = req.body.otp;
    console.log(phoneNumber + " " + otp);
    client.verify.v2
      .services(servicesSid)
      .verificationChecks.create({ to: phoneNumber, code: otp })
      .then((verification_check) => {
        console.log(verification_check.status);
        if (verification_check.status === "approved") {
          req.session.userloggedIn = true;
          // Redirect to the landing page after OTP is approved
          res.redirect("/");
        } else {
          // Handle the case when OTP is not approved, e.g., render an error page
          res.render("auth/userOtpVerification", { message: "Invalid OTP" });
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle the error if needed
        res.render("auth/userOtpVeri fication", {
          message: "OTP verification failed",
        });
      });
  } catch (err) {
    console.log("Error in verifying OTP", err);
    // Handle the error if needed
    res.render("auth/userOtpVerification", {
      message: "OTP verification failed",
    });
  }
};

const loadSearchProducts = async function (req, res) {
  try {
    const products = await Product.find();
    res.render("search", {
      layout: "layouts/userLayout",
      products: products,
    });
  } catch (error) {
    console.log("error in loading search page");
  }
};

const searchProducts = async function (req, res) {
  try {
    const { searchTerm } = req.body;
    console.log(searchTerm);
    if (searchTerm) {
      const searchRegex = new RegExp(`^${searchTerm}`, "i");
      const searchResults = await Product.find({ name: searchRegex });
      console.log(searchResults);

      return res.json({
        success: true,
        layout: "layouts/userLayout",
        products: searchResults,
      });
    }
  } catch (error) {
    console.log("error in searching products", error);
  }
};

const loadCheckout = async function (req, res) {
  try{
    const userId = req.session.userId;
  console.log(userId + "user id from the view cart");

  const cart = await Cart.findOne({ userId: userId }).populate("items.productId");
  let grandTotal = 0;
  let subtotal = 0;

  for (const item of cart.items) {
    const productPrice = item.productId.price;
    const totalPrice = productPrice * item.quantity;
    item.totalPrice = totalPrice;
    subtotal += totalPrice;
  }

  grandTotal = subtotal + 45.89 + 8.95;
  grandTotal=grandTotal.toFixed(2)
  await cart.save();

  const addresses = await Address.find();
  const products = cart.items.map((item) => item.productId);

  console.log(products);

  res.render("checkout", {
    layout: "layouts/userLayout",
    addresses: addresses,
    products: products,
    grandTotal: grandTotal,
    subtotal: subtotal,
  });
  } catch (err) {
    console.log("error in loading checkout",err);
  }
};


const addAddress = async function (req, res) {
  try {
    const {
      email,
      firstName,
      lastName,
      address,
      country,
      phoneNumber,
      state,
      zipCode,
      useForBilling,
    } = req.body;

    // Create a new address document
    const newAddress = new Address({
      email: email,
      fname: firstName,
      lname: lastName,
      address: address,
      country: country,
      state: state,
      zipcode: zipCode,
      user: userId,
      phoneNumber: phoneNumber,
      isBillingAddress: useForBilling,
    });

    await newAddress.save();

    return res.json({ success: true });
  } catch (err) {
    console.log("error in adding address", err);
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
  enterOtp,
  loadSearchProducts,
  searchProducts,
  loadCheckout,
  addAddress,
};
