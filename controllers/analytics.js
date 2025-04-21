const Subscription = require("../models/subscription");
const Transaction = require("../models/transaction");
const Sequelize = require("sequelize");

sales = async (req, res, next) => {
  try {
    const subs = await Subscription.findAll({
        include: [
          {
            model: Transaction,
            as: "transactions",
          },
        ],
    });
    res.status(200).json({
      success: true,
      data: subs,
      message: "Sales details",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

module.exports = {
  sales,
}
