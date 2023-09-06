var express = require("express");
var router = express.Router();

const upload = require("../middlewares/uploadImage")
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const crop = require("../middlewares/crop");

router.get("/add", productController.loadAddProduct);

router.post("/add", upload.single("image"), crop, productController.uploadProduct);


router.get("/list", productController.listAllProducts);

// all products usersisde
router.get("/allcategory", productController.userViewCategory);

router.post("/allcategory", productController.userViewCategory);

router.get("/add-category", categoryController.loadAddCategory);

router.post("/add-category", categoryController.addCategory);

router.get("/category/:categoryName", categoryController.loadEachCategory);

router.get("/product-detail/:ObjectId", productController.productDetail);

router.get("/edit/:ObjectId", productController.loadEditProduct);

router.post("/update/:ObjectId", productController.upadateProduct);

router.get("/deactivate/:ObjectId", productController.deactivateProduct);

router.get("/activate/:ObjectId", productController.activateProduct);

router.get("/list-category", categoryController.listCategoryAdminSide);

router.get("/edit-category/:ObjectId", categoryController.loadEditCategory);

router.post("/update-category/:ObjectId", categoryController.upadateCategory);

router.get(
  "/deactivate-category/:ObjectId",
  categoryController.deactivateCategory
);

router.get("/activate-category/:ObjectId", categoryController.activateCategory);

router.post("/sort", productController.sort)

router.post("/filter-price",productController.filterPrice)

// category offer

router.get("/offers",productController.loadOffers)

router.post("/add-offer",productController.addOffers)

router.post("/activate-offer",productController.activateOffer)

router.post("/deactivate-offer",productController.deactivateOffer)

// product offer

router.get("/offer",productController.loadProductOffers)

router.post("/add-product-offer",productController.addProductOffers)


module.exports = router;
