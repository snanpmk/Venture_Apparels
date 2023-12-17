const express = require('express')
const router  = express.Router()
const categoryController = require("../controllers/categoryController")

router.put("/apply-filter",categoryController.fetchFilterdPrdcs)

module.exports = router;