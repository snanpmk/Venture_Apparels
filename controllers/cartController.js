const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel")

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
      grandTotal = subtotal + 45.89;

      await cart.save();

      res.render("cart", {
        layout: "layouts/userLayout",
        products: cart.items,
        cart: cart,
        item: cart.items,
        subtotal: subtotal,
        grandTotal: grandTotal,
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

    const userId = req.session.userId;
    console.log("user id in update cart : " + userId);

    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    if (cart) {
      let grandTotal = 0;
      let subtotal = 0;
      let totalPrice=0;
      const itemToUpdate=cart.items.find(item=>item.productId._id.toString()===productId);
      if(itemToUpdate){
        itemToUpdate.quantity = quantity;
        const productPrice = itemToUpdate.productId.price;
        totalPrice = productPrice * quantity;
        itemToUpdate.totalPrice=totalPrice;
      }
      cart.items.forEach(item=>{
        subtotal+=item.totalPrice;
      });
      grandTotal = subtotal + 45.89;

    await cart.save();
    return res.json({
      totalPrice:totalPrice,
      subtotal:subtotal,
      grandTotal:grandTotal,
      productId:productId,
    })

  }

  } catch (error) {
    console.log("error in updating the product quantity", error);
  }
};

const deleteItem = async function (req,res) {
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
    console.log("error in deleting item",error);
  }
}

module.exports = {
  viewCart,
  addToCart,
  updateQuantity,
  deleteItem
};
