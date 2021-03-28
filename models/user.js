const Sequelize = require('sequelize');
const db = require('../db/sequelize');
const bcrypt = require('bcryptjs')

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


User.beforeCreate(async (user, options) => {
	user.password = await bcrypt.hash(user.password, 8)
});

module.exports = User
