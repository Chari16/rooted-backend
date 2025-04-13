const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Holidays = db.define(
  "pincodes",
  {
    code: {
      type: Sequelize.STRING,
      required: true,
    },
    description: {
      type: Sequelize.STRING,
      required: false,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      required: true,
      defaultValue: false,
    }
  },
  {
    freezeTableName: true,
  }
);

module.exports = Holidays;
