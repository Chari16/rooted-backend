const Sequelize = require("sequelize");
const Customer = require("./customer");
const MealBox = require("./mealBox");
const Cuisine = require("./cuisine");
const db = require("../db/sequelize");
const Subscription = require("./subscription");

const Order = db.define(
  "orders",
  {
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    orderDate: {
      type: Sequelize.DATE,
      required: true,
    },
    boxId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    cuisineId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      required: true,
    },
		subscriptionId: {
			type: Sequelize.INTEGER,
			allowNull: true,
		}
  },
  {
    freezeTableName: true,
  }
);

Customer.hasMany(Order, { foreignKey: "customerId", onDelete: "CASCADE" });
Order.belongsTo(Customer, { foreignKey: "customerId" });
MealBox.hasMany(Order, { foreignKey: "boxId", onDelete: "CASCADE" });
Order.belongsTo(MealBox, { foreignKey: "boxId", as: "box" });
Cuisine.hasMany(Order, { foreignKey: "cuisineId", onDelete: "CASCADE" });
Order.belongsTo(Cuisine, { foreignKey: "cuisineId", as: "cuisine" });
Subscription.hasMany(Order, { foreignKey: "subscriptionId", onDelete: "CASCADE" });
Order.belongsTo(Subscription, { foreignKey: "subscriptionId", as: "subscription" });

module.exports = Order;
