require("dotenv").config();

const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel")
const Address = require("../models/addressSchema");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel")
const Banner = require("../models/bannerModel")
const Referral = require("../models/referralModel")
const moment = require('moment');
const bcrypt = require("bcrypt");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const servicesSid = process.env.SERVICES_SID;
const twilio = require("twilio");
const client = twilio(accountSid, authToken);


// GET USER LANDING PAGE
const loadHome = async function (req, res) {
  try {



    const banner = await Banner.find()
    const products = await Product.find({ deleted: false }).sort({ upload: -1 }).limit(7);
    res.render("home", { layout: "layouts/userLayout", products: products, banners: banner });
  } catch (err) {
    console.log("Error registering user", err);
  }
};

// GET USER SIGN UP
const loadSignUp = async function (req, res) {
  try {
    const referralCode = req.query.referralCode
    console.log(referralCode + "😍😒💕");
    res.render("auth/userSignIn", { layout: "layouts/noLayout", referralCode: referralCode });
  } catch (err) {
    console.log("Error loading register", err);
  }
};

// HASHING USER PASSWORD
const securePassword = async (password) => {
  try {

    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log("Error hashing password", err);
  }
};

// POST USER SIGNUP
const RegisterUser = async function (req, res) {
  try {
    const referralCode = req.body.referralCode;
    console.log(referralCode + "😍heeeeeeeeeeeeeeu😒💕");

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
        // Check if a referral code exists and is not null
        if (referralCode) {
          // Find the referral associated with the given code
          const referral = await Referral.findOne({ referralCode });

          if (referral) {
            // Update the referredTo field with the newly created user's ID
            referral.referredTo = user._id;
            const updatereferal = await referral.save();
            console.log(updatereferal);
          }
        }


        // sendOtpSignup(req, res).catch((err) => {
        //   console.log("Error sending OTP", err);
        //   res
        //     .status(500)
        //     .json({ error: "Failed to send OTP. Please try again." });
        // });
      } else {
        res.status(500).json({ error: "Sign up failed." });
      }
    }
  } catch (err) {
    console.log("Error in Register User", err);
    res.status(500).json({ error: "Registration failed." });
  }
};


// SEND OTP IN SIGNUP
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

// GET USER LOGIN
const loadLogin = async function (req, res) {
  try {
    res.render("auth/userLogin", { layout: "layouts/userLayout" });
  } catch (err) {
    console.log("Error in loading login", err);
  }
};


// VERIFY LOGIN EMAIL
const login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(500).json({ error: "User not found" });
    }

    if (user.deleted == true) {
      return res.status(500).json({ error: "This account is blocked by the admin" })
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

// GET LOGIN WITH PHONENUMBER
const loadLoginPhone = async function (req, res) {
  try {
    res.render("auth/userOtpLogin", { layout: "layouts/userLayout" });
  } catch (err) {
    console.log("error in login with phone ", err);
  }
};

// SEND OTP IN LOGIN
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

  if (user.deleted == true) {
    return res.render("auth/userOtpLogin", {
      layout: "layouts/userLayout",
      message: "This account is blocked by the admin!!",
    })
  }

  const userId = user._id
  req.session.userId = userId
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
  res.render("auth/userOtpVerification", { layout: "layouts/userLayout" });
};

// GET OTP PAGE
const enterOtp = async function (req, res) {
  try {
    res.render("auth/userOtpVerification", { layout: "layouts/userLayout" });
  } catch (err) {
    console.log("error in loading otp input form", err);
  }
};

// VERIFY OTP
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
          res.render("auth/userOtpVerification", { message: "Invalid OTP", layout: "layouts/userLayout" });
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle the error if needed
        res.render("auth/userOtpVerification", {
          layout: "layouts/userLayout",
          message: "OTP verification failed",
        });
      });
  } catch (err) {
    console.log("Error in verifying OTP", err);
    // Handle the error if needed
    res.render("auth/userOtpVerification", {
      message: "OTP verification failed", layout: "layouts/userLayout"
    });
  }
};

// GET SEARCH
const loadSearchProducts = async function (req, res) {
  try {
    const products = await Product.find({ deleted: false });
    res.render("search", {
      layout: "layouts/userLayout",
      products: products,
    });
  } catch (error) {
    console.log("error in loading search page");
  }
};

// GET SEARCH PRODUCTS
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

// GET CHECKOUT
const loadCheckout = async function (req, res) {
  try {
    const userId = req.session.userId;
    console.log(userId + "❤️😂");
    console.log(userId + "user id from the load check out ");

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );
    let grandTotal = 0;
    let subtotal = 0;




    for (const item of cart.items) {
      let productPrice;
      if (item.productId.offerPrice) {
        productPrice = item.productId.offerPrice;

        const totalPrice = productPrice * item.quantity;
        item.totalPrice = totalPrice;
        subtotal += totalPrice;
      } else {
        productPrice = item.productId.price;
        const totalPrice = productPrice * item.quantity;
        item.totalPrice = totalPrice;
        subtotal += totalPrice;
      }

    }
    grandTotal = subtotal;
    grandTotal = grandTotal.toFixed(2);
    cart.subtotal = subtotal;
    await cart.save();

    const addresses = await Address.find({ user: userId, isDeleted: false });

    const referral = await Referral.findOne({
      $or: [
        { referredTo: userId }, 
        { referredFrom: userId, referredTo: { $ne: null } },
      ],
    });


    let coupons;
    if (referral) {
      coupons = await Coupon.find({});
    } else {
      coupons = await Coupon.find({ restricted: false });
    }

    const products = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    console.log(products);

    res.render("checkout", {
      layout: "layouts/userLayout",
      addresses: addresses,
      products: cart.items,
      grandTotal: grandTotal,
      coupons: coupons,

      moment: moment,
      subtotal: subtotal,
    });
  } catch (err) {
    console.log("error in loading checkout", err);
  }
};



// ADD ADDRESS
const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    let defaultAddress = false;

    const addresses = await Address.find({ user: userId });
    console.log(addresses);

    if (!addresses || addresses.length === 0) {
      defaultAddress = true;
    }

    console.log(defaultAddress);
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
    console.log("❤️❤️❤️❤️❤️❤️:fjadskhfkjsahfkjahjfaskhdjkfkhadskhfkj");
    console.log(req.body.email);

    // Create a new address document
    const newAddress = new Address({
      email: email,
      fname: firstName,
      lname: lastName,
      address: address,
      country: country,
      state: state,
      zipcode: zipCode,
      user: req.session.userId,
      phoneNumber: phoneNumber,
      isBillingAddress: useForBilling,
      defaultAddress: defaultAddress,
    });
    await newAddress.save();

    console.log("❤️❤️❤️❤️❤️❤️");

    return res.json({ success: true });
  } catch (error) {
    console.log("Error in adding address", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the address" });
  }
};

// GET THE ADDRESS TO EDIT
const getEditAdressData = async function (req, res) {
  try {
    const addressId = req.params.ObjectId;
    console.log(addressId);
    const address = await Address.findById({ _id: addressId });
    console.log(address + "fsdafs😂😂😂😂😂😂😂");
    return res.json({ address });
  } catch (error) {
    console.log("error in getEditAdressData", error);
  }
};

// UPDATE ADDRESS
const submitAddress = async function (req, res) {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const addressId = req.params.ObjectId;
    console.log(addressId, "from submit address");

    const formData = req.body;
    console.log(formData);

    // Access the form data values
    const email = formData.email;
    const firstName = formData.firstName;
    const lastName = formData.lastName;
    const address = formData.address;
    const country = formData.country;
    const phoneNumber = formData.phoneNumber;
    const state = formData.state;
    const zipCode = formData.zipCode;
    const useForBilling = formData.useForBilling;

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        email: email,
        fname: firstName,
        lname: lastName,
        address: address,
        country: country,
        phoneNumber: phoneNumber,
        state: state,
        zipcode: zipCode,
        isBillingAddress: useForBilling,
        user: userId,
      },
      { new: true }
    );

    console.log("Updated address:", updatedAddress);

    // Return the updated address as a response if needed
    res.json(updatedAddress);
  } catch (err) {
    console.log("error in submitting address", err);
    res.status(500).json({ error: "Error submitting address" });
  }
};

const deleteAddress = async function (req, res) {
  try {
    const addressId = req.body.addressId;
    const address = await Address.findOne({ _id: addressId });

    if (address) {
      address.isDeleted = true;
      await address.save();
      res.status(200).json({ message: "Address successfully deleted" });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.log("Error in deleting address", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userProfile = async function (req, res) {
  try {
    const userId = req.session.userId;
    const defaultAddress = await Address.findOne({ user: userId, defaultAddress: true });
    const allAddress = await Address.find({ user: userId, });
    const orders = await Order.find({ user: userId }).sort({ orderNumber: -1 })
      .populate("shippingAddress", "fname lname email address state country")
      .populate("items.product", "image name price")
      .sort({ date: -1 });


    res.render("profile", {
      layout: "layouts/userLayout",
      address: defaultAddress,
      allAddress: allAddress,
      allorders: orders,
    });
  } catch (err) {
    console.log("error in visiting user profile", err);
  }
};

const logout = async function (req, res) {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("error in logout", err);
      } else {
        res.clearCookie("connect.sid"); // Clear the session cookie
        res.redirect("/"); // Redirect to the login page or any other desired page
      }
    });
  } catch (err) {
    console.log("error in logout", err);
  }
};

const test = async function (req, res) {
  const categories = await Category.find();
  console.log(categories);
  res.render("sample1", {
    title: "Add Product",
    layout: "layouts/adminLayout",
    categories: categories,
    errorMessage: null,
  });
};

function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

const getReferalLink = async function (req, res) {
  try {
    const baseUrl = "http://venture-apparels.site/signup";
    const referredFrom = req.session.userId;
    let referralCode;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      referralCode = generateReferralCode(8);
      const existingReferral = await Referral.findOne({ referralCode });
      if (!existingReferral) {
        isCodeUnique = true;
      }
    }
    const referral = new Referral({
      referredFrom,
      referralCode,
      referredTo: null,
    });
    const savedReferral = await referral.save();
    const referralLink = `${baseUrl}?referralCode=${savedReferral.referralCode}`;
    console.log(referralLink);
    res.status(200).json({ referralLink });
  } catch (error) {
    console.log("Error in generating referral link: " + error);
    res.status(500).json({ error: "Internal server error" });
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
  getEditAdressData,
  submitAddress,
  deleteAddress,
  userProfile,
  logout,
  test,
  getReferalLink,
};
