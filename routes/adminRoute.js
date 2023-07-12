var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const sessionMiddleware = require("../middlewares/sessionMiddleware")

router.get('/',adminController.loadAdminLogin)

router.post('/',adminController.adminLogin) 

router.get('/dashboard',sessionMiddleware.isAdminLoggedIn,adminController.loadDashboard)

router.get('/list-user',adminController.listAllUsers)

router.get('/edit-user/:id',adminController.loadEditUser);

router.post('/edit-user/:id',adminController.loadUpdateUser);

router.get('/delete-user/:id',adminController.deleteUser)




module.exports = router;
 