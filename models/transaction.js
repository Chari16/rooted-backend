const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Order = db.define(
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
    }
  },
  {
    freezeTableName: true,
  }
);

module.exports = Order;
