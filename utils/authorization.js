const jwt = require('jsonwebtoken');
const config = require('../config')

/**
 * Generate new token with user id
 *
 * @param user
 */

const generateJwtToken = async (user) => {
    const { secrets, } = config;
    const { id, empId  } = user;
	const token = jwt.sign({ id, empId }, secrets.jwt, {
		expiresIn: secrets.jwtExp,
	});
	return token;
}

module.exports = { 
    generateJwtToken
}