const express = require('express')
const ordersController = require('../controllers/orders');
 
const router = express.Router()

router.get('/', ordersController.getOrders)
router.get('/kitchen-schedule', ordersController.getKitchenSchedule)
router.post('/pause', ordersController.pauseOrder)

module.exports = router;