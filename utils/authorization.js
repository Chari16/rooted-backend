const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Generate new token with user id
 *
 * @param user
 */

const generateJwtToken = async (user) => {
  const { secrets } = config;
  const { id } = user;
  const token = jwt.sign({ id }, secrets.jwt, {
    expiresIn: secrets.jwtExp,
  });
  return token;
};

/**
 * Get token from request header
 *
 * @param req
 */

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization;

  if (authorization && authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1].trim();
  }

  return null;
};

/**
 * Validate token\
 *
 * @param token
 */

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) {
        console.log(" jwt err ", err);
        return reject(err);
      }
      console.log(" payload ", payload);
      resolve(payload);
    });
  });

const serializeUser = (user) => {
  return {
    id: user.id,
  };
};

module.exports = {
  generateJwtToken,
  getTokenFromRequest,
  verifyToken,
  serializeUser,
};
