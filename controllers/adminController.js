const User = require("../models/userModel");
const Order = require("../models/orderModel")
const Category = require("../models/categoryModel")
const Banner = require("../models/bannerModel")
const Coupon = require("../models/couponModel")
const bcrypt = require("bcrypt");
const pdfKit = require("../config/pdfKit");
const Payment = require("../models/paymentModel");
// GET ADMIN LOGIN
const loadAdminLogin = function (req, res) {
  try {
    res.render("auth/adminSignIn", { layout: "layouts/noLayout" });
  } catch (err) {
    console.log("error in loading admin login", err);
  }
};

// GET ADMIN DASHBOARD
const loadDashboard = async function (req, res) {
  try {
    const users = await User.find().limit(7).sort({ createdAt: -1 });

    res.render("admin/dashboard", { allUsers: users });
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

// VERIFY ADMIN LOGIN
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

// GET ALL USERS
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
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
    console.log(user);
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
    console.log(user);
    res.redirect("/admin/users");
  } catch (err) {
    console.log("error in activating user", err);
  }
};


const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderNumber: -1 })
      .populate('shippingAddress', 'fname lname email address state country')
      .populate('items.product', 'image name price')
      .sort({ date: -1 });
    res.render("admin/orderListAdmin", {
      allorders: orders,

    })
  } catch (error) {
    console.log("error in listing orders ", error);
  }

};

const loadAddBanner = async function (req, res) {
  try {
    const banners = await Banner.find()
    res.render("admin/addBanner", {
      title: "Add Banner",
      layout: "layouts/adminLayout",
      errorMessage: null,
      banners: banners
    })
  } catch (error) {
    console.log("error in adding banner" + error);
  }
}

const addBanner = async function (req, res) {
  try {


    const { title, url, description } = req.body;
    const image = req.file.filename;
    const banner = new Banner({
      title,
      url,
      description,
      image,
    });

    const savedBanner = await banner.save();
    res.redirect('/admin/add-banner')
    console.log(savedBanner);
  } catch (error) {
    console.log('error in adding banner to db', error);
    res.status(500).json({ error: 'Error adding banner' });
  }
};
const deleteBanner = async function (req, res) {
  try {
    const bannerId = req.params.ObjectId
    console.log(bannerId);
    const banners = await Banner.findByIdAndDelete(bannerId)
    res.status(400).json({ success: true })
  } catch (error) {
    console.log("error in deleting banner", error);
  }
}
const downloadSalesReport = async function (req, res) {
  try {
    // Extract start and end dates from the request body
    const { startDate, endDate, reportType } = req.body;
    console.log(req.body.startDate);
    console.log(req.body.endDate);

    let thisMonthStartDate, thisMonthEndDate;

    // Check if startDate and endDate are provided in the request
    if (startDate && endDate) {
      // Use the provided dates
      thisMonthStartDate = new Date(startDate);
      thisMonthEndDate = new Date(endDate);
    } else {
      // Calculate default dates based on report type
      const currentDate = new Date();
      if (reportType === "monthly") {
        thisMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        thisMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (reportType === "weekly") {
        // Calculate one week back from today
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(currentDate.getDate() - 7);
        thisMonthStartDate = oneWeekAgo;
        thisMonthEndDate = currentDate;
      }
    }

    const reportData = await Order.find({
      date: {
        $gte: thisMonthStartDate,
        $lte: thisMonthEndDate,
      }
    }).populate('items.product');

    const modifiedReportData = reportData.map(order => {
      const modifiedItems = order.items.map(item => {
        return {
          orderNumber: order.orderNumber,
          date: order.date,
          product: item.product.name,
          quantity: item.quantity,
          price: item.totalPrice,
          total: item.quantity * item.totalPrice
        };
      });

      return modifiedItems;
    }).flat();

    // Call the pdfKit function with modifiedReportData and res
    pdfKit.generateSalesReport(modifiedReportData, res);
  } catch (error) {
    console.log("Error in downloading the sales report", error);
  }
}


const getSalesData = async function (req, res) {
  try {
    const periodOption = req.body.option;

    if (periodOption == 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      console.log(currentMonth);
      const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      let monthx = []
      for (let i = 0; i < 6; i++) {
        monthx.push(allMonths[currentMonth - i])
      }
      monthx = monthx.reverse()
      console.log(monthx);
      const startingMonth = (currentMonth - 5 + 12) % 12;

      const orderCountsLastSixMonths = [];


      for (let i = 0; i < 6; i++) {
        const month = (startingMonth + i) % 12; // Calculate the current month index
        const startingDate = new Date(currentDate.getFullYear(), month, 1);
        const endingDate = new Date(currentDate.getFullYear(), month + 1, 0);

        const orderCount = await Order.countDocuments({
          date: { $gte: startingDate, $lte: endingDate }
        });

        orderCountsLastSixMonths.push(orderCount);
      }

      console.log("Order counts for the last six months:", orderCountsLastSixMonths);
      return res.status(200).json({ orderCountsLastSixMonths, monthx })
    } else if (periodOption == 1) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      console.log(currentMonth);
      const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

      let monthx = [];
      for (let i = 0; i < 12; i++) {
        const index = (currentMonth - i + 12) % 12; // Calculate the correct index
        monthx.push(allMonths[index]);
      }
      monthx = monthx.reverse()
      console.log(monthx);
      const startingDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

      const orderCountsByMonth = []; // Array to store order counts for each month

      for (let i = 1; i <= 12; i++) {
        const startDate = new Date(startingDate.getFullYear(), startingDate.getMonth() + i, 1);
        const endDate = new Date(startingDate.getFullYear(), startingDate.getMonth() + i + 1, 0);

        const orderCountForMonth = await Order.countDocuments({
          date: { $gte: startDate, $lte: endDate }
        });

        orderCountsByMonth.push(orderCountForMonth);
      }

      console.log(orderCountsByMonth);
      return res.status(200).json({ orderCountsByMonth, monthx });
    }


    else {
      console.log("periodOption error");
    }

    res.status(200).json({ message: "Sales data fetched successfully" });
  } catch (error) {
    console.log("Error in getSalesData:", error);
    res.status(500).json({ error: "An error occurred while fetching sales data" });
  }
};

const getPolarGraphData = async function (req, res) {
  try {
    console.log(566);
    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'items.product', // Assuming 'items.product' references products
          foreignField: '_id',
          as: 'orderItems'
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'orderItems.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.name',
          orderCount: { $sum: 1 }
        }
      }
    ];

    // Execute the aggregation
    const result = await Order.aggregate(pipeline);
    console.log(result);

    // Create arrays to store the results
    const orderCountsByCategory = [];
    const categoryNames = [];

    // Iterate through the aggregation result and push counts and names to the arrays
    result.forEach(category => {
      orderCountsByCategory.push(category.orderCount);
      categoryNames.push(category._id); // Use _id to get the category name
    });
    console.log(orderCountsByCategory);
    console.log(categoryNames);
    const totalOrders = orderCountsByCategory.reduce((acc, order) => {
      return order = acc + order
    }, 0)

    console.log(totalOrders);
    return res.status(200).json({ orderCountsByCategory, categoryNames, totalOrders });
  } catch (error) {
    console.log("error in getting polar graph data", error);
    return res.status(500).json({ error: "Error getting polar graph data" });
  }
};

const getDoughNutData = async function (req, res) {
  try {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    console.log(currentYear + "     fffffffffffffff   " + lastYear);

    // Assuming you are using a MongoDB-like database and the collection is named "orders"
    const currentYearOrders = await Order.find({
      date: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) },
      // You need to adjust this based on your schema
    });


    const lastYearOrders = await Order.find({
      date: { $gte: new Date(lastYear, 0, 1), $lt: new Date(currentYear, 0, 1) },
      // You need to adjust this based on your schema
    });

    console.log(lastYearOrders+"dfghj");
    const currentYearTotalAmount = calculateTotalAmount(currentYearOrders);
    console.log(currentYearTotalAmount);
    const lastYearTotalAmount = calculateTotalAmount(lastYearOrders);

    const percentageChange = calculatePercentageChange(lastYearTotalAmount, currentYearTotalAmount);
    console.log("🔥%" + percentageChange);
    // You can then send this data as a response
    res.status(200).json({
      currentYear: currentYearTotalAmount,
      lastYear: lastYearTotalAmount,
      totalAmount: currentYearTotalAmount + lastYearTotalAmount,
      percentageChange: percentageChange
    });
  } catch (error) {
    console.log("error in getting doughnut graph data", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to calculate the sum of total amounts in an array of orders
function calculateTotalAmount(orders) {

  return orders.reduce((total, order) => total + order.totalAmount, 0);
}

function calculatePercentageChange(previousValue, currentValue) {
  if (previousValue === 0) {
    if (currentValue === 0) {
      return 0; // No change if both values are zero
    } else {
      return Infinity; // Treat as infinite percentage increase from zero
    }
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

const codPaid = async function (req, res) {
  const { orderId } = req.query; // Get the orderId from the query parameter

  try {
    // Find the order by ID and update the payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: 'PAID' } }, // Update the paymentStatus field
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const payment = await Payment.findOneAndUpdate(
      { order: orderId },
      { $set: { status: 'PAID' } }, // Update the paymentStatus field
      { new: true }

    )
    if (!payment) {
      return res.status(404).json({ message: 'payment not found' });
    }

    return res.status(200).json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating payment status' });
  }
}
// Replace OrderModel and the field names in the find queries with your actual schema

const listCoupons = async function (req, res) {
  try {
    const coupons = await Coupon.find()
    res.render("admin/couponsList",
      {
        title: "Add Coupons",
        layout: "layouts/adminLayout",
        errorMessage: null,
        coupons:coupons
      })
  } catch (error) {
    console.log("error in listing coupons" + error);
  }
}

const addCoupons = async function (req, res) {
  try {
    const { couponCode, minimumSpend, discount,expiryDate } = req.body;
    const coupon = new Coupon({
      couponCode,
      minimumSpend,
      discount,
      expiryDate,
    });

    const savedCoupon = await coupon.save();
    res.redirect('/admin/coupon')
  } catch (error) {
    console.log("error in listing coupons" + error);
  }
}

const deleteCoupon = async function (req, res) {
  try {
    const couponId = req.params.ObjectId
    const coupon = await Coupon.findByIdAndDelete(couponId)
    res.status(200).json({ success: true })
  } catch (error) {
    console.log("error in deleting Coupon", error);
  }
}

const blockCoupon = async function (req, res) {
  try {
    const couponId = req.params.ObjectId
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { isBlocked: true }, { new: true });
    res.status(200).json({ success: true })
  } catch (error) {
    console.log("error in blocking coupoon", error);
  }
}
const unblockCoupon = async function (req, res) {
  try {
    const couponId = req.params.ObjectId
    const updatedCoupon = await Coupon.findByIdAndUpdate({ _id: couponId }, { isBlocked: false }, { new: true });
    console.log("fdsfhsakfhajf");
    res.redirect('/admin/coupon')
  } catch (error) {
    console.log("error in blocking coupoon", error);
  }
}

module.exports = {
  adminLogin,
  loadAdminLogin,
  loadDashboard,
  listAllUsers,
  loadEditUser,
  loadUpdateUser,
  activateUser,
  deactivateUser,
  listAllOrders,
  loadAddBanner,
  addBanner,
  deleteBanner,
  downloadSalesReport,
  getSalesData,
  getPolarGraphData,
  getDoughNutData,
  codPaid,
  listCoupons,
  addCoupons,
  deleteCoupon,
  blockCoupon,
  unblockCoupon,

};
