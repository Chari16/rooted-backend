const express = require('express')
const paymentController = require('../controllers/payment');
 
const router = express.Router()

router.post('/payment', paymentController.createOrder)

module.exports = router;