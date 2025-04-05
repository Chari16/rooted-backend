const express = require('express')
const pincodeController = require('../controllers/pincode');
 
const router = express.Router()

router.post('/create', pincodeController.create)
router.get('/list', pincodeController.list)
router.get('/check-availability', pincodeController.checkAvailability)
router.get('/:id', pincodeController.getBoxDetails)
router.put('/:id', pincodeController.updateBoxDetails)
router.delete('/:id', pincodeController.deletePincode)

module.exports = router;