const express = require('express')
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create', userController.create)
router.get('/list', userController.list)
router.delete('/:id', userController.deleteUser)
router.get('/:id', userController.getUserDetails)
router.put('/:id', userController.updateUserDetails)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/admin/login', userController.adminLogin)

// authenticated route with middleware 
router.get('/search', auth, userController.search)

module.exports = router;