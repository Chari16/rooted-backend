const express = require('express')
const subscriptionController = require('../controllers/subscription');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/buy', auth, subscriptionController.buySubscription)
router.get('/list', auth, subscriptionController.list)
router.get('/list/:userId', subscriptionController.list)
router.get('/:id', auth, subscriptionController.getBoxDetails)
router.put('/:id', auth, subscriptionController.updateBoxDetails)
router.post('/active/:id', subscriptionController.getActiveSubscription)
router.post('/cancel/:id', subscriptionController.cancelSubscription)

module.exports = router;