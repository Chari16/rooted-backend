const express = require('express')
const userController = require('../controllers/user');
 
const router = express.Router()


router.post('/register', userController.register)
router.get('/search', userController.search)

module.exports = router;