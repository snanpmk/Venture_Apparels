require('dotenv').config();
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressSchema");
const Product = require("../models/productModel")
const Payment = require("../models/paymentModel")
const Razorpay = require('razorpay')
const crypto = require('crypto');
const uuid = require('uuid');
const User = require('../models/userModel');

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
  generatedSignature = razorpaySignature;
  return generatedSignature;
};


const verifyPayment = async function (req, res) {
  try {
    const createdOrderId = req.params.ObjectId
    const { paymentId, razorpaySignature } = req.body.payment;
    const orderId = req.body.orderId;
    console.log("Received payment verification request for orderId:", orderId);
    console.log("Received payment verification request for signature:", razorpaySignature);
    console.log("Received payment verification request for payment id:", paymentId);

    const keySecret = razorpayKeyId;

    // Validate the Razorpay signature
    const isValidSignature = validateRazorpaySignature(orderId, paymentId, razorpaySignature, keySecret);

    if (isValidSignature) {
      console.log("Payment verification successful for orderId:", orderId);

      const updatedPayment = await Payment.findOneAndUpdate(
        { user: req.session.userId, status: 'PENDING' }, // Find the correct payment record
        {
          status: 'PAID',
          transactionId: paymentId, // Use the actual transaction ID
        },
        { new: true } // Return the updated document
      );

      if (!updatedPayment) {
        console.log("Could not find the placeholder payment record.");
        return res.status(400).json({ success: false, error: 'Payment record not found' });
      }

      return res.status(200).json({ success: true, createdOrderId });
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
    console.log(userId + "🚀🚀🚀");

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    let orderItems = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    }));

    console.log(orderItems + "hey helllllllllllllllllllooooooooooo");


    const { paymentMethod, address, TotalAmount } = req.body;
    console.log(paymentMethod)
    console.log(address);
    console.log(TotalAmount + "💕 💕 💕");
    if (!paymentMethod) {
      console.log("Choose a payment option");
      return res.json("Choose a payment option");
    }

    if (paymentMethod === 'razorPay') {

      var razorPay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });

      const options = {
        amount: TotalAmount*100,
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      razorPay.orders.create(options, async function (err, order) {
        if (err) {
          res.status(500).json({ error: "Error creating RazorPay order" });
          return;
        }
        console.log("Razorpay Order ID:", order.id);

        // Call createOrder function for RazorPay payment
        const createdOrder = await createOrder(userId, orderItems, address, paymentMethod, TotalAmount);
        const createdOrderId = createdOrder._id

        return res.json({ success: true, orderId: order.id, createdOrderId, paymentMethod });
      });
    }


    if (paymentMethod === 'COD') {
      // Call createOrder function for COD payment
      const order = await createOrder(userId, orderItems, address, paymentMethod, TotalAmount);
      const createdOrderId = order._id
      console.log(order + "❤️🤣💕😭");
      return res.status(200).json({ success: true, paymentMethod, createdOrderId, order })
    }
  } catch (error) {
    console.log("Error in processing order", error);
    return res.status(500).json({ error: "Error processing order" });
  }
};


const createOrder = async (userId, orderItems, address, paymentMethod, TotalAmount) => {
  try {
    // Set order and payment statuses
    const orderStatus = "processing";
    let paymentStatus = 'PENDING';

    if (paymentMethod === 'razorPay') {
      paymentStatus = 'PAID';
    }



    // Create new order document
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: address,
      paymentMethod: paymentMethod,
      status: orderStatus,
      paymentStatus: paymentStatus,
      TotalAmount: TotalAmount
    });

    // Save the order
    const createdOrder = await order.save();


    // save the payment
    const transactionId = uuid.v4();

    const payment = new Payment({
      user: userId,
      amount: TotalAmount,
      paymentMethod: paymentMethod,
      status: paymentStatus,
      transactionId: transactionId,
      order: createdOrder._id

    })

    const createdPayment = await payment.save()

    if (createdOrder) {
      await Cart.updateOne({ userId: userId }, { $set: { items: [] } });
      for (const item of orderItems) {
        await updateStock(item.product, item.quantity);
      }
    }

    return order;
  } catch (error) {
    console.log("Error creating and saving order:", error);
    throw error;
  }
};

async function changeOrderStatus(req, res) {
  try {
    console.log(req.body.status);
    const orderId = req.body.orderId;
    const newStatus = req.body.status;
    let updateFields = {
      status: newStatus,
      date: new Date(),
    };

    if (newStatus === 'delivered') {
      // Set the delivery date to the current date
      updateFields.deliveryDate = new Date();

      // Calculate the return expiry date as 10 days after the delivery date
      const returnExpiryDate = new Date(updateFields.deliveryDate);
      returnExpiryDate.setDate(returnExpiryDate.getDate() + 10);
      updateFields.returnExpiryDate = returnExpiryDate;
    }

    const orderResult = await Order.findByIdAndUpdate(orderId, {
      $set: updateFields,
    });

    if (orderResult) {
      res.json({ status: true, message: 'Order updated' });
    } else {
      res.status(400).json({ status: false, message: 'Failed to update order' });
    }
  } catch (error) {
    console.error('Failed to change status:', error);
    res.status(500).json({ status: false, message: 'Failed to change status' });
  }
}



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
    const shippingCost = 0;
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
    const orderId = req.query.id;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: 'cancelPending', date: new Date() } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.redirect("/user-profile");
    }

    console.log("Order canceled:", updatedOrder);
    res.redirect("/user-profile");
  } catch (error) {
    console.log("Error in canceling order:", error);
    res.status(500).send("Error in canceling order.");
  }
};


const returnOrder = async function (req, res) {
  try {
    const orderId = req.params.ObjectId ;
    const reason = req.body.selectedReason

    const selectedItems = req.body.selectedItems;
    
    console.log(selectedItems);
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: 'returnPending', date: new Date() } },
      { new: true }
    );

      console.log(updatedOrder+"😒😒😒😒😒😒😒😒😒🚀");
    if (!updatedOrder) {
      return res.redirect("/user-profile");
    }

    res.redirect("/user-profile");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in updating order status.");
  }
};


module.exports = {
  processOrder,
  loadSuccessPage,
  orderDetail,
  cancelOrder,
  verifyPayment,
  changeOrderStatus,
  returnOrder
};
