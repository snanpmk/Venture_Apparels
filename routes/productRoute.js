var express = require("express");
var router = express.Router();
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
router.get("/add", productController.loadAddProduct);

router.post("/add", upload.single("image"), productController.uploadProduct);

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


module.exports = router;
