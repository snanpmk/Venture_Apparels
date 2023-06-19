var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')

router.get('/',adminController.loadAdminLogin)

router.post('/',adminController.adminLogin)

router.get('/dashboard',adminController.loadDashboard)

module.exports = router;
 