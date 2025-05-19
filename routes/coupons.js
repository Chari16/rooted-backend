const express = require('express')
const couponController = require('../controllers/coupon')
const auth = require('../middlewares/auth')
 
const router = express.Router()

router.post('/create',auth, couponController.create)
router.get('/list', auth, couponController.list)
router.get('/:id', auth, couponController.getCouponDetails)
router.put('/:id',auth, couponController.updateCouponDetails)
router.post('/apply',auth, couponController.applyCoupon)

module.exports = router;