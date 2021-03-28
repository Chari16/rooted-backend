const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const User = db.define('users', {
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        required: true
    },
    empId: {
        type: Sequelize.STRING,
        required: true,
    }
}, {
    freezeTableName: true
})

module.exports = User
