const categoryModel = require("../models/categoryModel");

const loadAddCategory = async function (req, res) {
  try {
    res.render('product/categories/add-category')
  } catch (err) {
    console.log("error in adding category", err);
  }
}; 

const addCategory = async function(req,res ){
  try {
    const name = req.body.categoryName
    const category = new categoryModel({name})

    const savedCategory = await category.save();

    res.status(201).json(savedCategory);
    console.log(savedCategory);
  } catch (err) {

  }
}

const loadJacketCategory = async function (req, res) {
  try {
    const category = req.body.category

  } catch(err) {
    console.log("error in loading jacket category");
  }
}

module.exports = {
  addCategory,
  loadAddCategory
};
