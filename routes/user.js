const express = require('express')
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');
 
const router = express.Router()

router.post('/create', auth, userController.create)
router.get('/list', auth, userController.list)
router.delete('/:id', auth, userController.deleteUser)
router.get('/:id', auth, userController.getUserDetails)
router.put('/:id', auth, userController.updateUserDetails)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/admin/login', userController.adminLogin)

// authenticated route with middleware 
router.get('/search', auth, userController.search)

module.exports = router;