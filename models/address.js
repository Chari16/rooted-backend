const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Address = db.define(
  "address",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address1: {
        type: Sequelize.STRING,
        required: false,
    },
    address2: {
        type: Sequelize.STRING,
        required: false,
    },
    department: {
        type: Sequelize.STRING,
        required: false,
    },
    designation: {
        type: Sequelize.STRING,
        required: false,
    },
    city: {
        type: Sequelize.STRING,
        required: false,
    },
    state: {
        type: Sequelize.STRING,
        required: false,
    },
    pincode: {
        type: Sequelize.STRING,
        required: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = Address;