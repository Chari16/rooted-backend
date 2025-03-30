const express = require('express')
const cuisineController = require('../controllers/cuisine');
 
const router = express.Router()

router.post('/create', cuisineController.create)
router.get('/list', cuisineController.list)
router.get('/:id', cuisineController.getCuisineDetails)
router.put('/:id', cuisineController.updateCuisineDetails)

module.exports = router;