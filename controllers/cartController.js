const Cart = require("../models/cartModel");
const Product = require("../models/productModel");


const viewCart = async function (req, res) {
  try {
    const userId = req.session.userId ;
    console.log(userId);
    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );
    let grandTotal = 0;
    let subtotal = 0;

    cart.items = cart.items.map((item) => {
      const productPrice = item.productId.price;
      const totalPrice = productPrice * item.quantity;
      item.totalPrice = totalPrice;
      subtotal += totalPrice;
      grandTotal = subtotal + 45.89;
      return item;
    });

    await cart.save(); // Save the updated cart
    
    // Assuming you have a `products` array from somewhere
    res.render("cart", {
      layout: "layouts/userLayout",
      products: cart.items,
      cart: cart,
      item: cart.items,
      subtotal: subtotal,
      grandTotal: grandTotal,
    });
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

const updateQuantity = async function (req, res) {
  try {
    const productId = req.params.ObjectId;
    console.log();
    const product = Product.findById({productId})
    console.log(product);
  } catch (error) {
    console.log("error in updating the product quantity",error);
  }
}


module.exports = {
  viewCart,
  addToCart,
  updateQuantity
};
