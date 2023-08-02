const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressSchema");
const Product = require("../models/productModel")

const updateStock = async function (productId, quantity) {
  try {
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    await product.save();
  } catch (error) {
    console.log("Error updating stock quantity", error);
  }
};
const processOrder = async function (req, res) {
  try {
    // fetch user
    const userId = req.session.userId;

    // fetch cart items
    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    console.log(cart);
    let orderItems = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    }));
    // upadate stock


    //  fetch payment mode and address
    const { paymentMethod, address } = req.body;
    console.log(paymentMethod);

    if (paymentMethod == 'COD') {
      var paymentStatus = 'PENDING'
    }

    if (!paymentMethod) {
      console.log("choose a payment option");
      return res.json("choose a payment option")
    }
    console.log(address);

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


    // Render the order success view
    const orderId = order._id;
    console.log(orderId);
    return res.json({ success: true, orderId });
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

    // Format order date as 'DD Month YYYY' (e.g., '12 July 2023')
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


module.exports = {
  processOrder,
  loadSuccessPage,
  orderDetail,
};
