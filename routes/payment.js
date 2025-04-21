const express = require('express')
const paymentController = require('../controllers/payment');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/order', paymentController.createOrder)
router.post('/create-order', paymentController.createNewOrder)

router.post('/success', paymentController.paymentSuccess)
router.post('/failed', paymentController.paymentFailed)
router.get('/revenue', paymentController.getRevenue)

module.exports = router;