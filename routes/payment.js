const express = require('express')
const paymentController = require('../controllers/payment');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/order', paymentController.createOrder)
router.post('/success', paymentController.paymentSuccess)
router.post('/failed', paymentController.paymentFailed)

module.exports = router;