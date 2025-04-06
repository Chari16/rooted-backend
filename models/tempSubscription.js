const Sequelize = require("sequelize");
const db = require("../db/sequelize");
const { all } = require("axios");

const TempSubscription = db.define(
  "temp_subscriptions",
  {
    amount: { //final amount
      type: Sequelize.FLOAT,
      required: true,
    },
		subscriptionType: { // 1monthl or weekly
			type: Sequelize.STRING,
      required: true,
		},
		weekendType: { // none, all, even , odd
			type: Sequelize.STRING,
      required: true,
		},
		dietType: {
			type: Sequelize.STRING,
			required: true,
		},
		startDate: {
			type: Sequelize.DATE,
			required: true,
		},
		endDate: {
			type: Sequelize.DATE,
			required: true,
		},
		status: { // active, inactive
			type: Sequelize.STRING,
			required: true,
		},
		// foreging key for user
		customerId: {
			type: Sequelize.INTEGER,
      allowNull: false
		},
		boxId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		itemCode: {
			type: Sequelize.STRING,
			required: true,
		},
		itemNames: {
			type: Sequelize.STRING,
			required: true,
		},
		orderId: {
			type: Sequelize.STRING,
			required: false,
		},
		cuisineChoice: {
			type: Sequelize.JSON,
			required: false,
		},
		deliveryType: {
			type: Sequelize.STRING,
			required: false,
			allowNull: true
		},
		selectedDates: {
			type: Sequelize.JSON,
			required: false,
			allowNull: true
		}
  },
  {
    freezeTableName: true,
  }
);

module.exports = TempSubscription;
