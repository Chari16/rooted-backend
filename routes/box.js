const express = require('express')
const boxController = require('../controllers/box');
 
const router = express.Router()

router.post('/create', boxController.create)
router.get('/list', boxController.list)
router.get('/:id', boxController.getBoxDetails)
router.put('/:id', boxController.updateBoxDetails)

module.exports = router;