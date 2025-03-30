const Sequelize = require('sequelize');
const db = require('../db/sequelize');
const bcrypt = require('bcryptjs')

const User = db.define('users', {
    firstName: {
        type: Sequelize.STRING,
        required: true,
    },
    lastName: {
        type: Sequelize.STRING,
        required: true,
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        required: true
    },
    role: {
        type: Sequelize.STRING,
        required: true
    },
    status: {
        type: Sequelize.STRING,
        required: true
    }
}, {
    freezeTableName: true
})


// User.beforeCreate(async (user, options) => {
// 	user.password = await bcrypt.hash(user.password, 8)
// });

module.exports = User
