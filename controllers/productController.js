const Product = require("../models/productModel");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const categoryController = require("./categoryController");
const Category = require("../models/categoryModel");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
      categories: categories,
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
      categories: categories,
    });
  } catch (err) {
    console.log("error in loading user category view", err);
  }
};

const productDetail = async function (req, res) {
  try {
    res.render("product/productDetail", { layout: "layouts/user-layout" });
  } catch (err) {
    console.log("error in loading product detail", err);
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
      category: new ObjectId(req.body.category),
    });

    // Save the product to the database
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
    console.log(product);
  } catch (err) {
    console.log("error in uploading product", err);
  }
};

const loadEditProduct = async function (req, res) {
  try {
    const categories = await Category.find();
    const productId = req.params.ObjectId; 
    const product = await Product.findOne({ _id: productId }); 
    // console.log(product);
    res.render("product/edit", { product: product ,categories: categories,}); 
  } catch (err) {
    console.log("Error in loading edit product", err);
  }
}

const upadateProduct = async function (req,res) {
  try {
    const productId = req.params.ObjectId; 
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const category = req.body.category;
    const image = req.body.image;

    const product = await Product.findOne({ _id: productId }); 
    
    product.name = name
    product.description = description
    product.category = category
    
    await product.save()
    console.log(product);
    
  } catch(err){
    console.log("error in updating product",err);
  }
}

const softDeleteProduct = async function (req, res) {
  try {
    const productId = req.params.ObjectId;
    console.log(productId);
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
    console.log(product);
    res.json(product);
  } catch (err) {
    console.log("Error in soft deleting product", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  listAllProducts,
  uploadProduct,
  loadAddProduct,
  userViewCategory,
  productDetail,
  loadEditProduct,
  upadateProduct,
  softDeleteProduct,
};
