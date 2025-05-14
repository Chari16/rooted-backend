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
  const { page, size, search } = req.query;
  console.log(" page ", page, size , search);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset);
  let whereCondition = {
  };
  if(search) {
    whereCondition = {
      code: {
        [Sequelize.Op.like]: `%${String(search)}%`
      }
    }
  }
  const coupons = await Coupon.findAll({ where: whereCondition ,limit, offset, order: [["createdAt", "DESC"]] });
  const totalCoupon = await Coupon.count({ where: whereCondition });
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
    const { status, value, code, validFrom, validTo } = req.body
    await Coupon.update({ status, value, code, validFrom, validTo }, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

applyCoupon = async (req, res, next) => {
  try {
    const { code, value, boxId, subscriptionType } = req.body;
    const coupon = await Coupon.findOne({ where: { code, boxId, subscriptionType } });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    console.log(" coupon from ", coupon.validFrom);
    console.log(" coupon to ", coupon.validTo);
    console.log(" currentr  date ", new Date());
    let discountedAmount = 0;
    let discountValue = 0
    if (coupon.validFrom < new Date() && coupon.validTo > new Date()) {
      // compute the discount
      if (coupon.discountType === "fixed") {
        discountedAmount = value - coupon.value;
        discountValue = coupon.value;
      }
      if (coupon.discountType === "percentage") {
        discountedAmount = value - (value * coupon.value) / 100;
        discountValue = (value * coupon.value) / 100;
      }
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Coupon is not valid",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        discountedAmount: discountedAmount,
        discountValue: discountValue,
        validFrom: coupon.validFrom,
        validTo: coupon.validTo,
        couponId: coupon.id,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  list,
  getCouponDetails,
  updateCouponDetails,
  applyCoupon
};
