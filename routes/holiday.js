const express = require('express')
const holidayController = require('../controllers//holiday');
 
const router = express.Router()

router.post('/create', holidayController.create)
router.get('/list', holidayController.list)
router.get('/:id', holidayController.getBoxDetails)
router.put('/:id', holidayController.updateBoxDetails)
router.delete('/:id', holidayController.deleteHoliday)

module.exports = router;