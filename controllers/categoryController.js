const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const loadAddCategory = async function (req, res) {
  try {
    res.render("category/addCategory");
  } catch (err) {
    console.log("error in adding category", err);
  }
};

const fetchFilterdPrdcs = async (req, res) => {
  try {
    const appliedFilters = req.body;
    console.log(appliedFilters);
    const products = await Product.find({ activity: { $in: appliedFilters } });
    return res.status(200).json({products:products})
  } catch (error) {
    console.log(error + "error in fetching products based on applied filters");
  }
};

const fetchCategory = async () => {
  try {
    const category = req.params.category;
  } catch (error) {
    console.log(error + "error in fetching category");
  }
};

const addCategory = async (req, res) => {
  try {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(500).json({ error: "Category name already exists." });
    }
    // Create a new category instance
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      gender: req.body.gender,
      ageGroup: req.body.ageGroup,
    });

    const savedCategory = await category.save();
    res.redirect("/product/list-category");
    console.log(savedCategory);
  } catch (err) {
    console.error(err);
    // res.status(500).json({ error: err.message });
  }
};

const loadEachCategory = async function (req, res) {
  try {
    const categoryName = req.params.categoryName;
    const category = await Category.findOne({
      name: categoryName,
      deleted: false,
    });

    if (!category) {
      // Handle case when category is not found
      console.log("Category not found");
      return;
    }

    const categoryId = category._id;
    const categories = await Category.find();
    const products = await Product.find({
      category: categoryId,
      deleted: false,
    });
    console.log(categories);

    res.render("category/eachCategory", {
      layout: "layouts/userLayout",
      products: products,
      categories: categories,
    });
  } catch (err) {
    console.log("Error in loading jacket category", err);
  }
};

const listCategoryAdminSide = async function (req, res) {
  try {
    const categories = await Category.find();
    res.render("category/listCategoryAdminSide", {
      title: "all category",
      layout: "layouts/adminLayout",
      categories: categories,
      errorMessage: null,
    });
  } catch (error) {
    console.log("error in listing category admin side", error);
  }
};
const loadEditCategory = async function (req, res) {
  try {
    const categoryId = req.params.ObjectId;
    const category = await Category.findOne({ _id: categoryId });
    // console.log(product);
    res.render("category/editCategory", { category: category });
  } catch (err) {
    console.log("Error in loading edit product", err);
  }
};

const upadateCategory = async function (req, res) {
  try {
    const categoryId = req.params.ObjectId;
    const name = req.body.name;
    const description = req.body.description;
    const gender = req.body.gender;
    const ageGroup = req.body.ageGroup;

    const category = await Category.findOne({ _id: categoryId });

    category.name = name;
    category.description = description;
    category.gender = gender;
    category.ageGroup = ageGroup;

    await category.save();
    console.log(category);
    res.redirect("/product/list-category");
  } catch (error) {
    console.log("error in updating product", error);
  }
};

const deactivateCategory = async function (req, res) {
  try {
    const categoryId = req.params.ObjectId;
    const category = await Category.findByIdAndUpdate(
      { _id: categoryId },
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
    res.redirect("/product/list-category");
  } catch (err) {
    console.log("Error in soft deleting Category", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateCategory = async function (req, res) {
  try {
    const categoryId = req.params.ObjectId;
    const category = await Category.findByIdAndUpdate(
      { _id: categoryId },
      {
        deleted: false,
        deletedAt: new Date(),
      },
      { new: true }
    );
    res.redirect("/product/list-category");
  } catch (err) {
    console.log("error in activating Category", err);
  }
};

module.exports = {
  addCategory,
  loadAddCategory,
  loadEachCategory,
  listCategoryAdminSide,
  loadEditCategory,
  upadateCategory,
  deactivateCategory,
  activateCategory,
  fetchFilterdPrdcs,
};
