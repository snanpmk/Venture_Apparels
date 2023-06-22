const categoryModel = require("../models/categoryModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const loadAddCategory = async function (req, res) {
  try {
    res.render("product/categories/add-category");
  } catch (err) {
    console.log("error in adding category", err);
  }
};

const addCategory = async function (req, res) {
  try {
    const name = req.body.categoryName;
    const category = new categoryModel({ name });

    const savedCategory = await category.save();

    res.status(201).json(savedCategory);
    console.log(savedCategory);
  } catch (err) {}
};

 const loadJacketCategory = async function (req, res) {
  try {
    const categoryName = req.params.categoryName;
    const category = await categoryModel.findOne({ name: categoryName });
    
    if (!category) {
      // Handle case when category is not found
      console.log("Category not found");
      return;
    }
    
    const categoryId = category._id;
    const categories = await categoryModel.find();
    const products = await Product.find({ category: categoryId });
    console.log(categories);

    res.render("product/categories/jackets", {
      layout: "layouts/user-layout",
      products: products,
      categories: categories,
    });
  } catch (err) {
    console.log("Error in loading jacket category", err);
  }
};


module.exports = {
  addCategory,
  loadAddCategory,
  loadJacketCategory,
};
