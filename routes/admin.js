var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')

router.get('/',adminController.loadAdminLogin)

router.post('/',adminController.adminLogin) 

router.get('/dashboard',adminController.loadDashboard)

router.get('/list-user',adminController.listAllUsers)

router.get('/edit-user/:id',adminController.loadEditUser);

router.post('/edit-user/:id',adminController.loadUpdateUser);

router.get('/delete-user/:id',adminController.deleteUser)




module.exports = router;
 