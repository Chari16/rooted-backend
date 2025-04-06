const Sequelize = require("sequelize");
const Customer = require("./customer");
const db = require("../db/sequelize");
const MealBox = require("./mealBox");

const Subscription = db.define(
  "subscriptions",
  {
    amount: { //final amount
      type: Sequelize.FLOAT,
      required: true,
    },
		subscriptionType: { // 1monthl or weekly or 1day
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
			required: true,
		},
		cuisineChoice: {
			type: Sequelize.JSON,
			required: false,
			allowNull: true
		},
		deliveryType: { //lunch, dinner
			type: Sequelize.STRING,
			required: false,
			allowNull: true
		}
  },
  {
    freezeTableName: true,
  }
);

Customer.hasMany(Subscription, { foreignKey: "customerId", onDelete: "CASCADE" });
Subscription.belongsTo(Customer, { foreignKey: "customerId" });
MealBox.hasMany(Subscription, { foreignKey: "boxId", onDelete: "CASCADE" });
Subscription.belongsTo(MealBox, { foreignKey: "boxId", as: "box" });

module.exports = Subscription;
