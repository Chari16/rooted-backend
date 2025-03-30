const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Payment = db.define(
  "payments",
  {
    amount: {
      type: Sequelize.INTEGER,
      required: true,
    },
		orderId: {
      type: Sequelize.STRING,
      required: true,
    },
		transactionId: {
			type: Sequelize.STRING,
			required: true,
		},
		status: {
			type: Sequelize.STRING,
      required: true,
		}
  },
  {
    freezeTableName: true,
  }
);

module.exports = Payment;
