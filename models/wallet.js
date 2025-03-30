const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Wallet = db.define(
  "wallet",
  {
    amount: {
      type: Sequelize.INTEGER,
      required: true,
    },
		transactionType: { // credit or debit
			type: Sequelize.STRING,
      required: true,
		}
  },
  {
    freezeTableName: true,
  }
);

module.exports = Wallet;
