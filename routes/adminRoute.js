var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const sessionMiddleware = require("../middlewares/sessionMiddleware")

router.get('/',adminController.loadAdminLogin)

router.post('/',adminController.adminLogin) 

router.get('/dashboard',sessionMiddleware.isAdminLoggedIn,adminController.loadDashboard)

router.get('/users',adminController.listAllUsers)

router.get('/edit-user/:id',adminController.loadEditUser);

router.post('/edit-user/:id',adminController.loadUpdateUser);

router.get("/activate-user/:ObjectId", adminController.activateUser);

router.get("/deactivate-user/:ObjectId", adminController.deactivateUser); 




module.exports = router;
 