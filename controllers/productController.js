const Product = require("../models/productModel");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const categoryController = require("./categoryController");
const Category = require("../models/categoryModel");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

const listAllProducts = async function (req, res) {
  try {
    const products = await Product.find();
    res.render("product/list", {
      title: "all Product",
      layout: "layouts/product-layout",
      products: products,
      errorMessage: null,
    });
  } catch (err) {
    console.log("error in listing products" + err);
  }
};
const loadAddProduct = async function (req, res) {
  try {
    const categories = await Category.find();
    console.log(categories);
    res.render("product/add", {
      title: "Add Product",
      layout: "layouts/admin-layout",
      categories:categories,
      errorMessage: null,
    });
  } catch (err) {
    console.log("error in loading add product", err);
  }
};
const userViewCategory = async function (req, res) {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    console.log(products);
    res.render("product/category", {
      layout: "layouts/user-layout",
      title: "Category",
      products: products,
      categories:categories
    });
  } catch (err) {
    console.log("error in loading user category view", err);
  }
};
const uploadProduct = async function (req, res) {
  try {
    const { name, price, description } = req.body;
    const image = req.file.filename; // Retrieve the uploaded image filename
    console.log(image);
    
    // Create a new product instance
    const product = new Product({
      name,
      price,
      description,
      image,
      category:new ObjectId (req.body.category)
    });

    // Save the product to the database
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
    console.log(product);
  } catch (err) {
    console.log("error in uploading product", err);
  }
};

const hoodies = async function(req,res) {
  try {
    const products = await Product.find().filter  ;
    res.render("product/list", {
      title: "all Product",
      layout: "layouts/product-layout",
      products: products,
      errorMessage: null,
    });
    res.render("product/categories/hoodies")
  } catch(err) {
    console.log("error in loading hoodie category",err);
  }
}

module.exports = {
  listAllProducts,
  uploadProduct,
  loadAddProduct,
  userViewCategory,
};
