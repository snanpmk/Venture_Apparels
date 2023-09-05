const Product = require("../models/productModel");
const Offer = require("../models/offerModel")
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Category = require("../models/categoryModel");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const uuid = require('uuid')
const uploadIamge = require("../middlewares/uploadImage")
const path = require('path')


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
    console.log("❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️");
    const { name, price, stock, description } = req.body;
    const croppedImage = req.croppedImagePath; // Use cropped image path
    console.log(croppedImage);
    const product = new Product({
      name,
      price,
      stock,
      description,
      image: croppedImage,
      category: new ObjectId(req.body.category),
    });

    // Save the product to the database
    const savedProduct = await product.save();
    res.redirect("/product/list");
    console.log(savedProduct);
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
    const sortedProducts = await Product.find({ deleted: false }).sort(sort);
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

    // Filter products based on price or offerPrice if offerPrice exists
    const filteredProducts = await Product.find({
      $and: [
        {
          $or: [
            { price: { $gte: parseFloat(min), $lte: parseFloat(max) } },
            { offerPrice: { $exists: true, $gte: parseFloat(min), $lte: parseFloat(max) } },
          ],
        },
        { deleted: false },
      ],
    });

    // Find categories
    const categories = await Category.find();

    return res.json({
      success: true,
      layout: "layouts/userLayout",
      title: "Category",
      products: filteredProducts,
      categories: categories,
    });
  } catch (error) {
    console.log("error in filtering with price", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const loadOffers = async function (req, res) {
  try {
    const offers = await Offer.find().populate('category')
    
    const categories = await Category.find()
    res.render("admin/offerList", {
      categories: categories,
      offers:offers,
      layout: "layouts/adminLayout",
      errorMessage: null,
    })
  } catch (error) {
    console.log("error while loading offers" + error);
  }
}

const addOffers = async function (req, res) {
  try {
    const { offerTitle, offerCategory, discountPercent, expiryDate } = req.body;
  
    const offer = new Offer({
      offerTitle,
      category:offerCategory,
      discountPercent,
      expiryDate,
    });

    const savedOffer = await offer.save();
    console.log(savedOffer);

    res.redirect("/product/offers")
  } catch (error) {
    console.log("error in adding offers" + error);
  }

}

const activateOffer = async function (req, res) {
  try {
    const offerId = req.query.id;
    if (!offerId) {
      return res.status(400).json({ message: 'Offer ID is required in the query parameter.' });
    }

    const offer = await Offer.findOne({ _id: offerId });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const expiryDate = offer.expiryDate;

    const currentDate = new Date();
    if (expiryDate <= currentDate) {
      return res.status(400).json({ message: 'Offer has expired.' });
    }

    const offerCategory = offer.category;
    const offersDiscount = offer.discountPercent;
    const discountPercent = offersDiscount / 100;

    // Use aggregation pipeline to update offerPrice and offerPercent
    const updatedProducts = await Product.updateMany(
      { category: offerCategory },
      [
        {
          $addFields: {
            offerPrice: {
              $subtract: ["$price", { $multiply: ["$price", discountPercent] }],
            },
            offerPercent: offersDiscount,
          },
        },
      ]
    );

    // Update the isActivated field to true
    await Offer.updateOne({ _id: offerId }, { isActivated: true });

    return res.status(200).json({ message: 'Offer activated successfully.' });
  } catch (error) {
    console.error("Error in activating offer:", error);

    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deactivateOffer = async function (req, res) {
  try {
    const offerId = req.query.id;
    if (!offerId) {
      return res.status(400).json({ message: 'Offer ID is required in the query parameter.' });
    }

    const offer = await Offer.findOne({ _id: offerId });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const offerCategory = offer.category;

    // Use aggregation pipeline to remove offerPrice and offerPercent
    const updatedProducts = await Product.updateMany(
      { category: offerCategory },
      [
        {
          $unset: "offerPrice", // Remove the offerPrice field
        },
        {
          $unset: "offerPercent", // Remove the offerPercent field
        },
      ]
    );

    await Offer.updateOne({ _id: offerId }, { isActivated: false });

    return res.status(200).json({ message: 'Offer deactivated successfully.' });
  } catch (error) {
    console.error("Error in deactivating offer:", error);

    return res.status(500).json({ error: 'Internal server error.' });
  }
};




module.exports = {
  listAllProducts,
  loadAddProduct,
  uploadProduct,
  userViewCategory,
  productDetail,
  loadEditProduct,
  upadateProduct,
  deactivateProduct,
  activateProduct,
  sort,
  filterPrice,
  loadOffers,
  addOffers,
  activateOffer,
  deactivateOffer
};