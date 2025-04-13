const Sequelize = require("sequelize");
const db = require("../db/sequelize");

const Coupon = db.define(
  "coupons",
  {
    code: {
      type: Sequelize.STRING,
      required: true,
    },
	description: {
		type: Sequelize.STRING,
		required: false,
	},
    value: {
      type: Sequelize.DECIMAL(10,2),
      required: true,
    },
    status: {
      type: Sequelize.STRING,
      required: true,
    },
		validFrom: {
			type: Sequelize.DATE,
			required: true,
		},
		validTo: {
			type: Sequelize.DATE,
			required: true,
		},
		boxId: {
			type: Sequelize.STRING,
			required: true,
		},
		subscriptionType: {
			type: Sequelize.STRING,
			required: true,
		},
		discountType: {
			type: Sequelize.STRING,
			required: true,
		}

  },
  {
    freezeTableName: true,
  }
);

module.exports = Coupon;
