const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const Employee = db.define('employees', {
    first_name: {
        type: Sequelize.STRING,
        required: true
    },
    last_name: {
        type: Sequelize.STRING,
        required: true
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    empId: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    organization: {
        type: Sequelize.STRING,
        required: true,
    }
}, {
    freezeTableName: true
})

module.exports = Employee
