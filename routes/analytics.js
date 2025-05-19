const express = require('express')
const analyticsController = require('../controllers/analytics');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.get('/sales', auth, analyticsController.sales)
router.get('/revenue',auth, analyticsController.revenue)
router.get('/subscribers',auth,  analyticsController.subscribers)
router.get('/top-zip-codes',auth,  analyticsController.topPerformingZipCodes)
router.get('/most-ordered-subscription',auth, analyticsController.mostOrderedSubscriptionType)
router.get('/most-ordered-cuisine-meal',auth, analyticsController.mostOrderedCuisineAndMeal)
router.get('/coupon-usage',auth, analyticsController.couponUsage)
router.get('/repeat-purchase-rate',auth, analyticsController.repeatPurchaseRate)
router.get('/paused-orders-count',auth, analyticsController.pausedOrdersCount)
router.post('/send-notification', analyticsController.sendMail)

module.exports = router;