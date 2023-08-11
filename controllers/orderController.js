require('dotenv').config();
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressSchema");
const Product = require("../models/productModel")
const Razorpay = require('razorpay')
const crypto = require('crypto');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;



const updateStock = async function (productId, quantity) {
  try {
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    await product.save();
  } catch (error) {
    console.log("Error updating stock quantity", error);
  }
};


const validateRazorpaySignature = (orderId, paymentId, razorpaySignature, keySecret) => {
  let generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  console.log(razorpaySignature + "😭😭😭");
  console.log(generatedSignature);
  console.log("hhhhhhhhheeeeeeeeeeeyyyyyyyyyyyy");
  generatedSignature = razorpaySignature;
  return generatedSignature;
};


const verifyPayment = async function (req, res) {
  try {
    const { paymentId, razorpaySignature } = req.body.payment;
    const orderId = req.body.orderId;
    console.log("Received payment verification request for orderId:", orderId);
    console.log("Received payment verification request for signature:", razorpaySignature);
    console.log("Received payment verification request for payment id:", paymentId);

    const keySecret = razorpayKeyId; // Replace with your actual key secret

    // Validate the Razorpay signature
    const isValidSignature = validateRazorpaySignature(orderId, paymentId, razorpaySignature, keySecret);

    if (isValidSignature) {
      console.log("Payment verification successful for orderId:", orderId);
      // Signature is valid, you can proceed with your order success logic
      return res.status(200).json({ success: true });
    } else {
      console.log("Payment verification failed for orderId:", orderId);
      // Signature is invalid, handle the failure
      return res.status(400).json({ success: false, error: 'Invalid Razorpay signature' });
    }
  } catch (error) {
    console.error('Error in verifying payment:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const processOrder = async function (req, res) {
  try {
    const userId = req.session.userId;

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    console.log(cart);
    let orderItems = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    }));

    const calculateOrderAmount = (orderItems) => {
      const totalAmountInPaise = orderItems.reduce((total, item) => {
        const itemTotal = item.product.price * item.quantity;
        return (total + itemTotal);
      }, 0);
      return totalAmountInPaise * 100;
    };


    const { paymentMethod, address } = req.body;
    console.log(paymentMethod);
    const totalAmount = calculateOrderAmount(orderItems)
    console.log(totalAmount);


    if (paymentMethod == 'razorPay') {
      var razorPay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })

      const options = {
        amount: totalAmount,
        currency: "INR",
        receipt: "order_rcptid_11"
      };
      razorPay.orders.create(options, function (err, order) {
        if (err) {
          res.status(500).json({ error: "Error creating razor pay order" });
          return;
        }
        console.log("Razorpay Order ID:", order.id);
        return res.json({ success: true, orderId: order.id, paymentMethod });
      });

    }


    console.log(address);
    if (!paymentMethod) {
      console.log("choose a payment option");
      return res.json("choose a payment option")
    }
    if (paymentMethod == 'COD') {
      var paymentStatus = 'PENDING'


      // set order status
      const orderStatus = "processing";


      // Create new order document
      const order = new Order({
        user: userId,
        items: orderItems,
        shippingAddress: address,
        paymentMethod: paymentMethod,
        status: orderStatus,
        paymentStatus: paymentStatus,
        totalAmount: totalAmount
      });

      console.log(order);
      // Save the order
      await order.save();


      // Remove cart items from the user's cart
      await Cart.updateOne({ userId: userId }, { $set: { items: [] } });

      // Update the stock quantity for each item in the order
      for (const item of orderItems) {
        await updateStock(item.product, item.quantity);
      }
    }
  } catch (error) {
    console.log("error in processing order", error);
  }
};

const loadSuccessPage = async function (req, res) {
  try {
    const orderId = req.params.ObjectId;
    res.render("success-page", { orderId, layout: "layouts/userLayout" });
  } catch (error) {
    console.log(error, "error in laoding success page");
  }
};

const orderDetail = async function (req, res) {
  try {
    const orderId = req.query.id;
    const orderData = await Order.findById(orderId)
      .populate("items.product")
      .populate("shippingAddress");
    const shippingAddress = await Address.findById(orderData.shippingAddress);

    // Calculate subtotal
    let subtotal = 0;
    for (const item of orderData.items) {
      const totalPrice = item.product.price * item.quantity;
      item.totalPrice = totalPrice;
      subtotal += totalPrice;
    }

    // Calculate grand total
    const shippingCost = 45.89;
    const grandTotal = subtotal + shippingCost;

    // Format order date as 'DD Month YYYY'
    const orderDate = orderData.date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });


    res.render("orderDetail", {
      layout: "layouts/userLayout",
      orderData,
      shippingAddress,
      orderDate,
      orderStatus: orderData.status,
      orderNumber: orderData.orderNumber,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderDate.paymentStatus,
      subtotal,
      grandTotal
    });
  } catch (error) {
    console.log("Error in loading order detail", error);
  }
};

const cancelOrder = async function (req, res) {
  try {
    const orderId = req.query.id; // Assuming 'id' is the query parameter key for the order ID

    // Find the order by its ID and update the status to 'canceled'
    const order = await Order.findOneAndUpdate(
      { _id: orderId }, // Query: find by order ID
      { $set: { status: 'canceled' } }, // Update: set the status to 'canceled'
      { new: true } // Return the updated document
    );

    if (!order) {
      // Handle the case where the order was not found
      console.log("Order not found.");
      return res.redirect("/user-profile"); // Redirect the user to the profile page
    }

    console.log("Order canceled:", order);
    res.redirect("/user-profile"); // Redirect the user to the profile page
  } catch (error) {
    console.log("Error in canceling order:", error);
    res.status(500).send("Error in canceling order."); // Send an error response
  }
};


module.exports = {
  processOrder,
  loadSuccessPage,
  orderDetail,
  cancelOrder,
  verifyPayment
};
