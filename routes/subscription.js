const express = require('express')
const subscriptionController = require('../controllers/subscription');
 
const router = express.Router()

router.post('/buy', subscriptionController.buySubscription)
router.get('/list', subscriptionController.list)
router.get('/list/:userId', subscriptionController.list)
router.get('/:id', subscriptionController.getBoxDetails)
router.put('/:id', subscriptionController.updateBoxDetails)

module.exports = router;