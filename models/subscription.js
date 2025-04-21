const Sequelize = require("sequelize");
const Customer = require("./customer");
const db = require("../db/sequelize");
const MealBox = require("./mealBox");
const Transaction = require("./transaction");

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
			unique: true,
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
		},
		selectedDates: {
			type: Sequelize.JSON,
			required: false,
			allowNull: true
		},
  },
  {
    freezeTableName: true,
  }
);

Customer.hasMany(Subscription, { foreignKey: "customerId", onDelete: "CASCADE" });
Subscription.belongsTo(Customer, { foreignKey: "customerId" });
MealBox.hasMany(Subscription, { foreignKey: "boxId", onDelete: "CASCADE" });
Subscription.belongsTo(MealBox, { foreignKey: "boxId", as: "box" });
Subscription.hasMany(Transaction, { foreignKey: 'orderId', sourceKey: 'orderId', onDelete: "CASCADE" });
Transaction.belongsTo(Subscription, { foreignKey: 'orderId', targetKey: 'orderId', onDelete: "CASCADE", as: 'transactions' });
module.exports = Subscription;
