const Product = require("../models/productModel");
const User = require("../models/userModel")
const Cart = require("../models/cartModel")
const Order = require("../models/orderModel")

async function addOrderDetails(addressId, paymentMethod, userId, req, res) {
    try {
      if (!['razorpay', 'cashOnDelivery'].includes(paymentMethod)) {
        throw new Error('Invalid payment method');
      }
      //fetching the cart items and total
      const cartResult = await Cart.findOne({ user: userId }).select('items totalPrice quantity');
  
      if (cartResult) {
        //crate transaction id
        const transactionId = crypto
          .createHash('sha256')
          .update(`${Date.now()}-${Math.floor(Math.random() * 12939)}`)
          .digest('hex')
          .substr(0, 16);
  
        const orderStatus = paymentMethod === 'cashOnDelivery' ? 'processing' : 'pending';
  
        const order = new Order({
          user: userId,
          items: cartResult.items,
          shippingAddress: addressId,
          paymentmethod: paymentMethod,
          transactionId: transactionId,
          status: orderStatus,
          total: cartResult.totalPrice,
        });
  
       
  
        for (const item of cartResult.items) {
          const quantity = item.quantity;
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stocks: -quantity } },
            { new: true },
          );
        }
        await order.save();
        await Cart.deleteOne({ user: userId });
        return { status: true, order: order ,cartResult };
      } else {
        return { status: false };
      }
    } catch (error) {
      handleError(res, error);
    }
  }

module.exports = {
    addOrderDetails
}