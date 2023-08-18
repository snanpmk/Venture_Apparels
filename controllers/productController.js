const Product = require("../models/productModel");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const categoryController = require("./categoryController");
const Category = require("../models/categoryModel");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const listAllProducts = async function (req, res) {
  try {
    const products = await Product.find().populate('category');
    
    res.render("product/list", {
      title: "All Products",
      layout: "layouts/adminLayout",
      products: products,
      errorMessage: null,
    });
  } catch (err) {
    console.log("Error in listing products", err);
  }
};


const loadAddProduct = async function (req, res) {
  try {
    const categories = await Category.find();
    console.log(categories);
    res.render("product/add", {
      title: "Add Product",
      layout: "layouts/adminLayout",
      categories: categories,
      errorMessage: null,
    });
  } catch (err) {
    console.log("error in loading add product", err);
  }
};



const userViewCategory = async function (req, res) {
  const currentPage = req.query.page || 1;
  const productsPerPage = 6;
  try {
    const skip = (currentPage - 1) * productsPerPage;
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Get blocked category IDs
    const blockedCategoryIds = await Category.find({ deleted: true }).distinct('_id');

    // Fetch products excluding those with blocked categories
    const products = await Product.find({ deleted: false, category: { $nin: blockedCategoryIds } })
      .limit(productsPerPage)
      .skip(skip);

    const categories = await Category.find({ deleted: false });
    res.render("category/allCategory", {
      layout: "layouts/userLayout",
      title: "Category",
      products: products,
      categories: categories,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log("error in loading user category view", err);
  }
};

const productDetail = async function (req, res) {
  try {
    const productId = req.params.ObjectId;
    console.log(productId);
    const product = await Product.findOne({ _id: productId });
    console.log(product);
    res.render("product/productDetail", {
      layout: "layouts/userLayout",
      product: product,
    });
  } catch (err) {
    console.log("error in loading product detail", err);
  }
};

const uploadProduct = async function (req, res) {
  try {
    const { name, price, stock, description } = req.body;
    const image = req.file.filename; // Retrieve the uploaded image filename
    console.log(image);

    // Create a new product instance
    const product = new Product({
      name,
      price,
      stock,
      description,
      image,
      category: new ObjectId(req.body.category),
    });

    // Save the product to the database
    const savedProduct = await product.save();
    res.redirect("/product/list")
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
    res.render("product/edit", { product: product, categories: categories });
  } catch (err) {
    console.log("Error in loading edit product", err);
  }
};

const upadateProduct = async function (req, res) {
  try {
    const productId = req.params.ObjectId;
    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const description = req.body.description;
    const category = req.body.category;

    console.log(stock);

    const product = await Product.findOne({ _id: productId });

    product.name = name;
    product.description = description;
    product.category = category;
    product.price = price;
    product.stock = stock;

    await product.save();
    console.log(product);
    res.redirect("/product/list");
  } catch (err) {
    console.log("error in updating product", err);
  }
};

const deactivateProduct = async function (req, res) {
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
    res.redirect("/product/list");
  } catch (err) {
    console.log("Error in soft deleting product", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateProduct = async function (req, res) {
  try {
    const productId = req.params.ObjectId;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        deleted: false,
        deletedAt: new Date(),
      },
      { new: true }
    );
    console.log(product);
    res.redirect("/product/list");
  } catch (err) {
    console.log("error in activating product", err);
  }
};

const sort = async function (req, res) {
  try {
    // console.log(req.body);
    const { sortOption } = req.body;
    // Create a sort object based on the specified criteria
    let sort;
    switch (sortOption) {
      case "lowToHigh":
        sort = { price: 1 };
        break;
      case "highToLow":
        sort = { price: -1 };
        break;
      case "releaseDate":
        sort = { createdAt: -1 };
        break;
      default:
        sort = {};
        break;
    }
    const sortedProducts = await Product.find().sort(sort);
    console.log(sortedProducts);
    const categories = await Category.find;
    // return
    console.log(sortedProducts);

    return res.json({
      success: true,
      layout: "layouts/userLayout",
      title: "Category",
      products: sortedProducts,
      categories: categories,
    });
  } catch (err) {
    console.log("error in sorting the products", err);
  }
};

const filterPrice = async function (req, res) {
  try {
    const { min, max } = req.body;

    const filteredProducts = await Product.find({
      price: { $gte: parseFloat(min), $lte: parseFloat(max) },
    });

    const categories = await Category.find;
    // return
    // console.log();

    return res.json({
      success: true,
      layout: "layouts/userLayout",
      title: "Category",
      products: filteredProducts,
      categories: categories,
    });
  } catch (error) {
    console.log("error in filtering with price", error);
  }
}

module.exports = {
  listAllProducts,
  uploadProduct,
  loadAddProduct,
  userViewCategory,
  productDetail,
  loadEditProduct,
  upadateProduct,
  deactivateProduct,
  activateProduct,
  sort,
  filterPrice,
};