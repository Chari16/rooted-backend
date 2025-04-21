const express = require('express')
const analyticsController = require('../controllers/analytics');
 
const router = express.Router()

router.get('/sales', analyticsController.sales)

module.exports = router;