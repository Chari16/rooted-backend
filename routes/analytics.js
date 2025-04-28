const express = require('express')
const analyticsController = require('../controllers/analytics');
 
const router = express.Router()

router.get('/sales', analyticsController.sales)
router.get('/revenue', analyticsController.revenue)
router.get('/subscribers', analyticsController.subscribers)
router.get('/top-zip-codes', analyticsController.topPerformingZipCodes)
router.get('/most-ordered-subscription', analyticsController.mostOrderedSubscriptionType)
router.get('/most-ordered-cuisine-meal', analyticsController.mostOrderedCuisineAndMeal)
router.get('/coupon-usage', analyticsController.couponUsage)
router.get('/repeat-purchase-rate', analyticsController.repeatPurchaseRate)
router.get('/paused-orders-count', analyticsController.pausedOrdersCount)
router.post('/send-notification', analyticsController.sendMail)

module.exports = router;