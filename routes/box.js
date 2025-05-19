const express = require('express')
const boxController = require('../controllers/box');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create',auth, boxController.create)
router.get('/list',auth, boxController.list)
router.get('/:id',auth, boxController.getBoxDetails)
router.put('/:id',auth, boxController.updateBoxDetails)

module.exports = router;