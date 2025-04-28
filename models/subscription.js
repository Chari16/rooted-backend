const Sequelize = require("sequelize");
const Customer = require("./customer");
const db = require("../db/sequelize");
const MealBox = require("./mealBox");
const Transaction = require("./transaction");
const Address = require("./address");

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
			allowNull: false,
			unique: true,
		},
		transactionId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
			  model: "transactions", // References the transactions table
			  key: "id",
			},
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
		addressId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
			model: "address", // References the customers table
			key: "id",
			},
			onDelete: "CASCADE", //
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

Transaction.hasOne(Subscription, { foreignKey: 'transactionId', as: 'subscription' });
Subscription.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Address.hasOne(Subscription, { foreignKey: "addressId", as: "subscription" });
Subscription.belongsTo(Address, { foreignKey: "addressId", as: "address" });

module.exports = Subscription;
