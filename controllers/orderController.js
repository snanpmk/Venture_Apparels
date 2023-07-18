const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

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

    //  fetch payment mode and address
    const { paymentMethod, address } = req.body;
    console.log(paymentMethod);
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
    });

    console.log(order);
    // Save the order
    await order.save();
    console.log("order save successfffffffffffffffffffullllllllllllyyyyyyyyyyy");
    // Render the order success view
    const orderId = order._id;
    console.log(orderId);
    // res.render("success-page", { orderId });
  } catch (error) {
    console.log("error in processing order", error);
  }
};




module.exports = {
  processOrder,
};
