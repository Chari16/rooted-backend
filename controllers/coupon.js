const Coupon = require("../models/coupon");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// to get pagination information
getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

create = async (req, res, next) => {
  try {
    await Coupon.create(req.body);
    res.status(200).json({
      success: true,
      message: "Coupon created successfully",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

list = async (req, res, next) => {
  const { page, size } = req.query;
  console.log(" page ", page, size);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset);
  const coupons = await Coupon.findAll({ limit, offset });
  const totalCoupon = await Coupon.count();
  res.status(200).json({
    success: true,
    coupons,
    count: totalCoupon,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalCoupon / limit),
  });
};

getCouponDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findOne({ where: { id } });
    if (!coupon) {
      res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (e) {
    next(e);
  }
};

updateCouponDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body);
    const coupon = await Coupon.findOne({ where: { id } });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    console.log(" coupon ", coupon);
    const { status, value, code } = req.body
    await Coupon.update({ status, value, code }, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  create,
  list,
  getCouponDetails,
  updateCouponDetails,
};
