const Sequelize = require("sequelize");
const Transaction = require("../models/transaction");
const Razorpay = require("razorpay");
const crypto = require('crypto');

// to get pagination information
getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: employees } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, employees, totalPages, currentPage };
};

list = async (req, res, next) => {
  const { page, size } = req.query;
  console.log(" page ", page, size);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset);
  const mealBoxes = await MealBox.findAll({ limit, offset });
  const totalBoxes = await MealBox.count();
  res.status(200).json({
    success: true,
    mealBoxes,
    count: totalBoxes,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalBoxes / limit),
  });
};

createOrder = async (req, res, next) => {
  try {
    const instance = new Razorpay({
      key_id: "rzp_test_wX9is0g9eug5V3",
      key_secret: "SeBUQOo8QEKEY75gqH36NX5E",
    });

    // const options = {
    //   amount: 50000,
    //   currency: "INR",
    // };

    const { amount, gst, shippingAmount, discount, customerId } = req.body;
    const order = await instance.orders.create({ amount, currency: "INR" });
    await Transaction.create({
      customerId: customerId,
      orderId: order.id,
      status: "created",
      amount: amount,
      gst: gst,
      shippingAmount: shippingAmount,
      discount: discount,
    });

    // if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.log(" error ", error);
    res.status(500).send(error);
  }
};

paymentSuccess = async (req, res, next) => {
  try {
    // getting the details back from our font-end
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", "SeBUQOo8QEKEY75gqH36NX5E");

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.log(" error ", error);
    res.status(500).send(error);
  }
};

paymentFailed = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const transaction = await Transaction.findOne({ where: { orderId } });
    if (!transaction) return res.status(404).send("Transaction not found");

    await Transaction.update({ status: "failed" }, { where: { orderId } });

    res.json({ success: true });
  } catch (error) {
    console.log(" error ", error);
    res.status(500).send(error);
  }
};

webhook = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(" error ", error);
    res.status(500).send(error);
  }
};

module.exports = {
  list,
  createOrder,
  webhook,
  paymentSuccess,
  paymentFailed,
};
