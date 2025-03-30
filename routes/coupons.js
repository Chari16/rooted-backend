const express = require('express')
const couponController = require('../controllers/coupon')
 
const router = express.Router()

router.post('/create', couponController.create)
router.get('/list', couponController.list)
router.get('/:id', couponController.getCouponDetails)
router.put('/:id', couponController.updateCouponDetails)

module.exports = router;