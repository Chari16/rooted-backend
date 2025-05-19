const express = require('express')
const pincodeController = require('../controllers/pincode');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create', auth, pincodeController.create)
router.get('/list', auth, pincodeController.list)
router.get('/check-availability', pincodeController.checkAvailability)
router.get('/:id', auth, pincodeController.getBoxDetails)
router.put('/:id', auth, pincodeController.updateBoxDetails)
router.delete('/:id',auth, pincodeController.deletePincode)

module.exports = router;