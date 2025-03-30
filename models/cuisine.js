const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Cuisine = db.define(
  "cuisines",
  {
    name: {
      type: Sequelize.STRING,
      required: true,
    },
		itemCode: {
			type: Sequelize.STRING,
      required: true,
			unique: true
		},
    description: {
      type: Sequelize.STRING,
      required: false,
    },
    image: {
      type: Sequelize.STRING,
    	required: false,
    },
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		}
  },
  {
    freezeTableName: true,
  }
);

module.exports = Cuisine;
