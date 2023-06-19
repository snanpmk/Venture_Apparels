const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const loadAdminLogin = function (req, res) {
  try {
    res.render("admin/signin");
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
      return res.render("admin/signin", {
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      if (user.is_verified === 1) {
        res.send("welcome admin");
      }
    } else {
      return res.render("admin/signin", {
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    console.log("admin login error", err);
  }
};

module.exports = {
  adminLogin,
  loadAdminLogin,
  loadDashboard
};
