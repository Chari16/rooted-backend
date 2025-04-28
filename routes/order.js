const express = require('express')
const ordersController = require('../controllers/orders');
 
const router = express.Router()

router.get('/', ordersController.getOrders)
router.get('/details', ordersController.getOrdersList)
router.get('/download-details', ordersController.downloadOrdersExcel);
router.get('/kitchen-schedule', ordersController.getKitchenSchedule)
router.post('/pause', ordersController.pauseOrder)
router.get('/trial-meals', ordersController.getTrialMeals)

module.exports = router;