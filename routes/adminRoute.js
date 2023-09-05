var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const sessionMiddleware = require("../middlewares/sessionMiddleware")
const upload = require("../helpers/banners.upload")
const orderController = require("../controllers/orderController")


router.get('/', adminController.loadAdminLogin)

router.post('/', adminController.adminLogin)

router.get('/dashboard', adminController.loadDashboard)

router.get('/users', adminController.listAllUsers)

router.get('/edit-user/:id', adminController.loadEditUser);

router.post('/edit-user/:id', adminController.loadUpdateUser);

router.get("/activate-user/:ObjectId", adminController.activateUser);

router.get("/deactivate-user/:ObjectId", adminController.deactivateUser);

router.get("/orders", adminController.listAllOrders);

router.get("/add-banner", adminController.loadAddBanner)

router.post("/add-banner", upload.single("image"), adminController.addBanner)

router.delete("/delete-banner/:ObjectId", adminController.deleteBanner)

router.get("/download-report", adminController.downloadSalesReport)

router.post("/sales-data", adminController.getSalesData)

router.post("/polarGraph-data", adminController.getPolarGraphData)

router.post("/doughnut-data", adminController.getDoughNutData)

router.post("/order-status", orderController.changeOrderStatus)

router.post("/cod-paid", adminController.codPaid)

router.get("/coupon",adminController.listCoupons)

router.post("/add-coupon",adminController.addCoupons)

router.delete("/delete-coupon/:ObjectId",adminController.deleteCoupon)

router.put("/block-coupon/:ObjectId",adminController.blockCoupon) 

router.get("/unblock-coupon/:ObjectId",adminController.unblockCoupon)


module.exports = router;
