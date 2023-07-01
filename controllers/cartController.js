const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const viewCart = async function (req, res) {
    try {
      const userId = req.session.userId;
  
      const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
      const products = cart.items.map(item => item.productId);
  
      res.render("cart", { layout: "layouts/userLayout", products: products, cart:cart });
    } catch (err) {
      console.log("error in viewing cart", err);
    }
  };
  
const addToCart = async function (req, res) {
    try {
      const userId = req.session.userId;
      const productId = req.params.ObjectId;
  
      console.log(userId + "❤️❤️❤️" + productId);
  
      let cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        cart = await Cart.create({ userId });
      }
  
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );
      if (existingItem) {
        // Increase the quantity by 1 when viewing the cart
        existingItem.quantity += 1;
      } else {
        // If the product doesn't exist, add a new item to the cart
        cart.items.push({ productId, quantity: 1 }); // Initialize quantity to 1 for new items
      }
  
      await cart.save();
      res
        .status(200)
        .json({ message: "Product added to cart successfully", cart });
    } catch (err) {
      console.log("error in adding to the cart", err);
      res
        .status(500)
        .json({ error: "An error occurred while adding the product to cart" });
    }
  };
  

module.exports = {
  viewCart,
  addToCart,
};
