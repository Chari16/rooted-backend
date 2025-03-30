const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Holidays = db.define(
  "holidays",
  {
    name: {
      type: Sequelize.STRING,
      required: true,
    },
		date: {
			type: Sequelize.DATE,
			required: true,
		},
		year: {
			type: Sequelize.INTEGER,
      required: true,      
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
