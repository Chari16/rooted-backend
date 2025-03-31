const Sequelize = require('sequelize');
const { DATABASE, USERNAME, PASSWORD, HOSTNAME } = process.env;
console.log(" DATABASE", PASSWORD)

const sequelize = new Sequelize(DATABASE, USERNAME, PASSWORD, {
		host: HOSTNAME,
		dialect: 'mysql',
		define: {
			freezeTableName: true
		},
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		}
});

module.exports = sequelize