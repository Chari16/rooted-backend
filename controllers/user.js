const User = require('../models/user')
const Employee = require('../models/employee')


register = async(req, res, next) => {
    try {
        console.log(" my body ", req.body)
        const { email, password, empId } = req.body
        await Employee.create(req.body)
        await User.create({ email, password, empId })
        
        res.status(200).json({
            success: true,
            message: "User registered successfully"
        })
    }
    catch(e) {
        next(e)
    }
}

module.exports = {
    register
}