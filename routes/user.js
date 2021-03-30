const express = require('express')
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');
 
const router = express.Router()


router.post('/register', userController.register)
router.post('/login', userController.login)

// authenticated route with middleware 
router.get('/search', auth, userController.search)

module.exports = router;