const express = require('express')
const customerController = require('../controllers/customers');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create', customerController.create)
router.get('/list',auth, customerController.list)
router.get('/:id',auth, customerController.getCustomerDetails)
router.put('/:id',auth, customerController.updateCustomerDetails)
// type = otp, google, facebook
router.post('/login', customerController.login)
router.post('/verifyOtp', customerController.verifyOtp)
router.post('/auth/facebook', customerController.facebookLogin)
router.post('/auth/google', customerController.googleLogin)

module.exports = router;