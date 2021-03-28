const {Router} = require('express')
const morgan = require('morgan')
const cors = require('cors')

const router = Router()

router.use(cors())
router.use(morgan('dev'))

module.exports = router;