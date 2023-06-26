const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const loadAdminLogin = function (req, res) {
  try {
    res.render("auth/adminSignIn");
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
    if (isPasswordValid) {
      if (user.is_verified === 1) {
        res.send("welcome admin");
      }
    } else {
      return res.render("auth/adminSignIn", {
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    console.log("admin login error", err);
  }
};

const listAllUsers = async function (req, res) {
  try {
    const users = await User.find();
    console.log(users);
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

const deleteUser = async function ( req, res ){
  try {
    const id = req.params.id;
    await User.deleteOne({_id : id})
    res.redirect('/admin/list-user')
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  adminLogin,
  loadAdminLogin,
  loadDashboard,
  listAllUsers,
  loadEditUser,
  loadUpdateUser, 
  deleteUser
};
