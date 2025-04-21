const Sequelize = require("sequelize");
const Subscription = require("./subscription");
const db = require("../db/sequelize");

const Transaction = db.define(
  "transactions",
  {
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    orderId: {
      type: Sequelize.STRING,
      allowNull: false,
			unique: true
    },
    status: {
      type: Sequelize.STRING,
      required: true,
    },
    amount: {
      type: Sequelize.FLOAT,
      required: true,
    },
		gst: {
			type: Sequelize.FLOAT,
			required: true,
		},
		shippingAmount: {
			type: Sequelize.FLOAT,
			required: true,
		},
		discount: {
			type: Sequelize.FLOAT,
			required: true,
		},
    razorpayPaymentId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    walletAdjusted: {
      type: Sequelize.FLOAT,
      required: false,
    },
    couponCode: {
      type: Sequelize.STRING,
      required: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = Transaction;
