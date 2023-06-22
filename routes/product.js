var express = require("express");
var router = express.Router();
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController")
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

router.get("/allcategory",productController.userViewCategory);

router.get('/add-category',categoryController.loadAddCategory)

router.post('/add-category',categoryController.addCategory)

router.get('/category/:categoryName',categoryController.loadJacketCategory)

module.exports = router;
  