const User = require('../models/user')
const Employee = require('../models/employee')


register = async(req, res, next) => {
    console.log(" my body ", req.body)
    res.status(200).json({
        success: true,
        message: "Fine"
    })
}

module.exports = {
    register
}