const express = require('express')
const holidayController = require('../controllers//holiday');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create',auth, holidayController.create)
router.get('/list',auth, holidayController.list)
router.get('/:id',auth, holidayController.getBoxDetails)
router.put('/:id',auth, holidayController.updateBoxDetails)
router.delete('/:id',auth, holidayController.deleteHoliday)

module.exports = router;