const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const MealBox = db.define(
  "mealBox",
  {
    name: {
      type: Sequelize.STRING,
      required: true,
    },
    description: {
      type: Sequelize.STRING,
      required: true,
    },
		image: {
			type: Sequelize.STRING,
      required: false,
		},
    choicesAllowed: {
      type: Sequelize.STRING, // yes, no
      required: false,
    },
    noOfChoices: {
      type: Sequelize.INTEGER,
      required: false,      
    },
    weekPrice: {
      type: Sequelize.INTEGER,
      required: true,
    },
    monthPrice: {
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

module.exports = MealBox;
