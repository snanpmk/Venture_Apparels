const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel")
const Coupon = require("../models/couponModel")
const Order = require("../models/orderModel")
const viewCart = async function (req, res) {
  try {
    const userId = req.session.userId
    console.log(userId + "user id from the view cart");

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    if (cart) {
      let grandTotal = 0;
      let subtotal = 0;
      for (const item of cart.items) {
        const productPrice = item.productId.price;
        const totalPrice = productPrice * item.quantity;
        item.totalPrice = totalPrice;
        subtotal += totalPrice;
      }

      var limitMssg = ""
      
      grandTotal = subtotal + 45.89;
      await cart.save();

      res.render("cart", {
        layout: "layouts/userLayout",
        products: cart.items,
        cart: cart,
        item: cart.items,
        subtotal: subtotal,
        grandTotal: grandTotal,
        limitMssg: limitMssg
      });
    } else {
      const uesrCart = await Cart.create({ userId });
      res.render("cart", {
        layout: "layouts/userLayout",
        item: uesrCart.items,
      });
    }
  } catch (err) {
    console.log("error in viewing cart", err);
  }
};

const addToCart = async function (req, res) {
  try {
    const userId = req.session.userId;
    const productId = req.params.ObjectId;

    console.log("❤️userid:" + userId);
    console.log("💕productId:" + productId);

    let cart = await Cart.findOne({ userId: userId });

    // if cart not exist create one
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // if cart exist check for product exists
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (itemIndex > -1) {
      // If product already in cart, update its quantity and price
      cart.items[itemIndex].quantity += 1;
      cart.items[itemIndex].price = productId.price;
    } else {
      // If product not in cart, add new item to the items array
      cart.items.push({
        productId: productId,
      });
    }

    // Save the updated cart
    await cart.save();

    // show the cart after adding the product
    res.redirect("/cart/view");
  } catch (err) {
    console.log("error in adding to the cart", err);
  }
};

const updateQuantity = async function (req, res) {
  try {
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    const product = await Product.findOne({ _id: productId })
    console.log(product);
    if (quantity == product.stock) {
      limitMssg = "Sorry , Maximum quantity of this product is reached"
    }
    else {
      limitMssg = ""
    }

    console.log(limitMssg);
    const userId = req.session.userId;
    console.log("user id in update cart :😒😒😒😒😒 " + userId);

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    if (cart) {
      let grandTotal = 0;
      let subtotal = 0;
      let totalPrice = 0;
      const itemToUpdate = cart.items.find(item => item.productId._id.toString() === productId);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        const productPrice = itemToUpdate.productId.price;
        totalPrice = productPrice * quantity;
        itemToUpdate.totalPrice = totalPrice;
      }
      cart.items.forEach(item => {
        subtotal += item.totalPrice;
      });
      grandTotal = subtotal + 45.89;

      await cart.save();
      return res.json({
        totalPrice: totalPrice,
        subtotal: subtotal,
        grandTotal: grandTotal,
        productId: productId,
        limitMssg: limitMssg
      })

    }

  } catch (error) {
    console.log("error in updating the product quantity", error);
  }
};

const deleteItem = async function (req, res) {
  try {
    const productId = req.body.productId;
    const userId = req.session.userId;

    // Find the user's cart and remove the item with the given productId
    const cart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    ).populate("items.productId");

    // Recalculate the subtotal and grand total
    let subtotal = 0;
    let grandTotal = 0;
    for (const item of cart.items) {
      subtotal += item.productId.price * item.quantity;
    }
    grandTotal = subtotal + 45.89;

    await cart.save();

    return res.json({
      subtotal: subtotal,
      grandTotal: grandTotal
    });
  } catch (error) {
    console.log("error in deleting item", error);
  }
}
const updateCouponDiscount = async function(req, res) {
  try {
    const couponCode = req.body.couponCode;
    const subtotal = parseFloat(req.body.subtotalValue); // Parse subtotal as a float

    console.log("Coupon Code: " + couponCode);
    console.log("Subtotal: " + subtotal);

    // Find the coupon by code
    const coupon = await Coupon.findOne({ couponCode: couponCode });

    if (!coupon) {
      // Handle the case where the coupon doesn't exist
      console.log("Coupon not found");
      // Respond with an appropriate message or status code
      return res.status(404).json({ message: "Coupon not found" });
    }

    const decrementPercentage = coupon.discount;
    console.log("Discount Percentage: " + decrementPercentage);

    // Calculate the discount amount
    const discountAmount = (decrementPercentage / 100) * subtotal;


    const discountedSubtotal = subtotal - discountAmount;

    console.log("Discount Amount: " + discountAmount);
    console.log("Discounted Subtotal: " + discountedSubtotal);

        
    // Respond with the discounted subtotal or any other relevant information
    return res.status(200).json({discountedSubtotal,discountAmount});
  } catch (error) {
    console.log("Error in updating coupon discount", error);
    // Handle the error and respond with an appropriate message or status code
    return res.status(500).json({ message: "Internal Server Error",success:true });
  }
};

module.exports = {
  viewCart,
  addToCart,
  updateQuantity,
  deleteItem,
  updateCouponDiscount,
};
