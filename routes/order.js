const express = require('express')
const ordersController = require('../controllers/orders');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.get('/',auth, ordersController.getOrders)
router.get('/details',auth, ordersController.getOrdersList)
router.get('/download-details',auth, ordersController.downloadOrdersExcel);
router.get('/kitchen-schedule',auth, ordersController.getKitchenSchedule)
router.post('/pause',auth, ordersController.pauseOrder)
router.get('/trial-meals',auth, ordersController.getTrialMeals)
router.get('/paused/:id',auth, ordersController.getPausedOrders)

module.exports = router;