const User = require('../models/user')
const Employee = require('../models/employee')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;


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

//GET /search?&page=1&size=5
//GET /search?&page=1&size=5&sortBy=first_name:DESC
//GET /search?first_name=text&sortBy=first_name:DESC
//GET /search?first_name=text&page=0&size=10&sortBy=first_name:DESC
//GET /search?first_name=text&last_name=text&page=0&size=10&sortBy=first_name:DESC
search = async(req, res, next) => {
    try {
        const { page, size, first_name, last_name, empId } = req.query
        const findOptions = [] 
        const order = []

        const { limit, offset } = getPagination(page, size)

        if(first_name)
            findOptions.push({ first_name: { [Op.like]: first_name } })
        if(last_name)
            findOptions.push({ last_name: { [Op.like]: last_name } })
        if(empId)
            findOptions.push({ empId: { [Op.like]: empId } })

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            order.push(parts)
        }
        else 
            order.push(["first_name", "ASC"])

        const results = await Employee.findAndCountAll({
            limit,
            offset,
            where: { 
                [Op.and]: findOptions
            },
            order
        })
        const employees = getPagingData(results, page, limit)
        
        res.status(200).json({
            success: true,
            data: employees
        })
    }
    catch(e) {
        next(e)
    }
}

// to get pagination information
getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
};

getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: employees } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, employees, totalPages, currentPage };
};

module.exports = {
    register,
    search
}