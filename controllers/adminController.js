const { render } = require("ejs");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Order = require("../models/orderModel")

const loadAdminLogin = function (req, res) {
  try {
    res.render("auth/adminSignIn",{layout:"layouts/noLayout"});
  } catch (err) {
    console.log("error in loading admin login", err);
  }
};
const loadDashboard = async function (req, res) {
  try {
    res.render("admin/dashboard");
  } catch (err) {
    console.log("error in loading admin login", err);
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

const adminLogin = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, " " + password);

    const user = await User.findOne({ email: email });
    console.log(user);

    if (!user) {
      return res.render("auth/adminSignIn", {
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(500).json({ error: "Incorrect password" });
    } else {
      if (user && user.id) {
        req.session.userId = user.id;
        req.session.adminLoggedIn = true;
        console.log(req.session.userId);
      }
      res
      .status(200)
      .json({ success: true, message: "logged in successfully" });
        
    }
  } catch (err) {
    console.log("admin login error", err);
  }
};

const listAllUsers = async function (req, res) {
  try {
    const users = await User.find();
    res.render("admin/userList", { allUsers: users });
  } catch (err) {
    console.log("error in listing useres", err);
  }
};

const loadEditUser = async function (req, res) {
  try {
    const id = req.params.id;
    console.log(id);
    const userData = await User.findById(id).lean();
    console.log(userData);
    if (userData) {
      res.status(200).render("admin/userEdit", { user: userData });
    }
  } catch (error) {
    res.status(500).render("admin/users");
  }
};

const loadUpdateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body.email;
    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const users = await User.find();
    console.log(email);
    console.log(phoneNumber);
    let user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).render("admin/userList", {
        message: "User not found",
      });
    }
    user.email = email;
    user.name = name;
    user.phoneNumber = phoneNumber;
    await user.save();
    return res.redirect("/admin/userList");
  } catch (error) {
    return res.status(500).render("admin/userList", {
      message: "Error editing user",
    });
  }
};

const deactivateUser = async function (req, res) {
  try {
    const userId = req.params.ObjectId;
    console.log(userId);
    const product = await User.findByIdAndUpdate(
      { _id: userId },
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
    res.redirect("/admin/users");
  } catch (err) {
    console.log("Error in soft deleting user", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateUser = async function (req, res) {
  try {
    const userId = req.params.ObjectId;
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        deleted: false,
        deletedAt: new Date(),
      },
      { new: true }
    );
    res.redirect("/admin/users");
  } catch (err) {
    console.log("error in activating user",err);
  }
};


const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
    .populate('shippingAddress', 'fname lname email address state country')
    .populate('items.product', 'image name price')
    .sort({ date: -1 });
    res.render("admin/orderListAdmin",{
      allorders: orders,

    })
  } catch(error) {
    console.log("error in listing orders ",error);
  }

};

module.exports = {
  adminLogin,
  loadAdminLogin,
  loadDashboard,
  listAllUsers,
  loadEditUser,
  loadUpdateUser,
  activateUser,
  deactivateUser,
  listAllOrders
};
