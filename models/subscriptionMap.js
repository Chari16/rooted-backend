const Sequelize = require("sequelize");
const Cuisine = require("./cuisine");
const Subscription = require("./subscription");
const db = require("../db/sequelize");

const SubscriptionMap = db.define(
  "subscriptionMap",
  {
		subscriptionId:  { type: Sequelize.DataTypes.INTEGER, allowNull: false },
		cuisineId: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
  },
  {
    freezeTableName: true,
  }
);

Subscription.belongsToMany(Cuisine, { through: SubscriptionMap, foreignKey: "subscriptionId" });
Cuisine.belongsToMany(Subscription, { through: SubscriptionMap, foreignKey: "cuisineId" });

module.exports = SubscriptionMap;
