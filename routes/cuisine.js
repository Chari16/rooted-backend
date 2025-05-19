const express = require('express')
const cuisineController = require('../controllers/cuisine');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create',auth, cuisineController.create)
router.get('/list',auth, cuisineController.list)
router.get('/:id',auth, cuisineController.getCuisineDetails)
router.put('/:id',auth, cuisineController.updateCuisineDetails)

module.exports = router;