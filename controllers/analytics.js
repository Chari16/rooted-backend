const { Order, Cuisine, MealBox } = require("../models");
const nodemailer = require("nodemailer");
const Address = require("../models/address");
const Subscription = require("../models/subscription");
const Transaction = require("../models/transaction");
const Sequelize = require("sequelize");
const { corporateTemplate, feedbackTemplate } = require("../utils/mailTransporter");
const { SUBJECT } = require("../constants");

sales = async (req, res, next) => {
  try {

    const start = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999); // Set end date to the end of the day
    // const subs = await Subscription.findAll({
    //   include: [
    //     {
    //       model: Transaction,
    //       as: "transactions",
    //     },
    //   ],
    // });
    console.log(" my start ", start)
    console.log(" my end ", end)
    const dailyTotalSales = await Transaction.sum("amount", {
      where: {
        createdAt: {
          [Sequelize.Op.between]: [start, end], // Filter by date range
        },
      },
    }) || 0;

    console.log(" my daily total sales ", dailyTotalSales)

    const currentDate = new Date();

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyTotalSales = await Transaction.sum("amount", {
      where: {
        createdAt: {
          [Sequelize.Op.between]: [monthStart, monthEnd], // Filter by date range
        },
      },
    }) || 0;

    // Compute the starting date of the week (Monday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    startOfWeek.setDate(currentDate.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day

    // Compute the ending date of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day

    console.log(" my start of week ", startOfWeek)
    console.log(" my end of week ", endOfWeek)

    const weeklyTotalSales = await Transaction.sum("amount", {
      where: {
        createdAt: {
          [Sequelize.Op.between]: [startOfWeek, endOfWeek], // Filter by date range
        },
      },
    }) || 0;

    const tillDateTotalSales = await Transaction.sum("amount", {
    }) || 0;

    res.status(200).json({
      success: true,
      // data: subs,
      dailyTotalSales,
      monthlyTotalSales,
      weeklyTotalSales,
      tillDateTotalSales,
      message: "Sales details",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

revenue = async (req, res, next) => {
// calculate revenue by subscription type
  try {
    const revenueBySubscriptionType = await Subscription.findAll({
      attributes: [
        "id",
        "subscriptionType",
        [Sequelize.fn("SUM", Sequelize.col("transaction.amount")), "totalRevenue"],
      ],
      include: [
        {
          model: Transaction,
          as: "transaction",
          attributes: [],
        },
      ],
      group: ["id","subscriptionType"],
    });

    console.log(" revenueBySubscriptionType ", revenueBySubscriptionType)

    // Initialize default values
    const transformedRevenue = {
      monthly: 0,
      weekly: 0,
      trial: 0,
    };

    // Merge query results into the default object
    revenueBySubscriptionType.forEach((item) => {
      transformedRevenue[item.subscriptionType] = parseFloat(item.dataValues.totalRevenue) || 0;
    });

    res.status(200).json({
      success: true,
      data: transformedRevenue,
      message: "Revenue by subscription type",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
}

subscribers = async (req, res, next) => {
  try {
    // total active subscribers
    // check active based on end date greater than current date
    const currentDate = new Date();
    const totalActiveSubscribers = await Subscription.count({
      where: {
        endDate: {
          [Sequelize.Op.gt]: currentDate,
        },
      },
    });
    // new subscribers numbers by daily, weekly, monthly
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00 of the current date

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); 
    const dailyNewSubscribers = await Subscription.count({
      where: {
        createdAt: {
          [Sequelize.Op.between]: [startOfDay, endOfDay], // Filter by date range),
        },
      },
    });
    // Compute the starting date of the week (Monday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    startOfWeek.setDate(currentDate.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day
    // Compute the ending date of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day
    const weeklyNewSubscribers = await Subscription.count({
      where: {
        createdAt: {
          [Sequelize.Op.between]: [startOfWeek, endOfWeek], // Filter by date range
        },
      },
    });
    // monthly new subscribers
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const monthlyNewSubscribers = await Subscription.count({
      where: {
        createdAt: {
          [Sequelize.Op.between]: [monthStart, monthEnd], // Filter by date range
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalActiveSubscribers,
        dailyNewSubscribers,
        weeklyNewSubscribers,
        monthlyNewSubscribers
      },
      message: "Sales details",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
}

topPerformingZipCodes = async(req, res, next) => {
  // top performing zip codes
  // check based on the number of orders 
  // get the zip codes from the orders table
  // get the top 5 zip codes based on the number of orders
  try {
    const topZipCodes = await Address.findAll({
      attributes: [
        "pincode",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orderCount"],
      ],
      group: ["pincode"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: topZipCodes,
      message: "Top performing zip codes",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
 
}

mostOrderedSubscriptionType = async(req, res, next) => {
  // most ordered subscription type
  // based on subscriptionType stored in subscriptions Model
  // monthly, weekly, trial
  try {
    const mostOrderedSubscriptionType = await Subscription.findAll({
      attributes: [
        "subscriptionType",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orderCount"],
      ],
      group: ["subscriptionType"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: mostOrderedSubscriptionType,
      message: "Most ordered subscription type",
    });
  }
  catch(e) {
    console.log(" error ", e);
    next(e);
  }
}

mostOrderedCuisineAndMeal = async(req, res, next) => {
  // most ordered cuisine
  // and most ordered meal Type 
  try {
    const mostOrderedCuisine = await Order.findAll({
      attributes: [
        "cuisineId",
        [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "orderCount"],
      ],
      include: [
        {
          model: Cuisine,
          as: "cuisine",
        },
      ],
      where: {
        cuisineId: {
          [Sequelize.Op.ne]: 6,
        }
      },
      group: ["cuisineId", "cuisine.id"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("orders.id")), "DESC"]],
    });

    const mostOrderedMealType = await MealBox.findAll({
      attributes: [
        "id", // Include the MealBox ID
        "name", // Include the MealBox name (if applicable)
        [Sequelize.fn("COUNT", Sequelize.col("subscriptions.id")), "orderCount"], // Count subscriptions
      ],
      include: [
        {
          model: Subscription,
          as: "subscriptions",
          attributes: [], // Exclude subscription attributes from the result
          required: false, // Use LEFT OUTER JOIN to include MealBoxes with no subscriptions
        },
      ],
      group: ["mealBox.id"], // Group by MealBox ID
      order: [[Sequelize.fn("COUNT", Sequelize.col("subscriptions.id")), "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { 
        mostOrderedCuisine,
        mostOrderedMealType
      },
      message: "Most ordered cuisine and meal type",
    });
  }
  catch(e) {
    console.log(" error ", e);
    next(e);
  }
}

couponUsage = async(req, res, next) => {
  // top 5 higly used coupons
  // based on the number of times used    
  try {
    const couponCounts = await Transaction.findAll({
      attributes: [
        "couponCode",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orderCount"],
      ],
      where: {
        couponCode: {
          [Sequelize.Op.ne]: "",
        }
      },
      group: ["couponCode"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 5,
    })
    res.status(200).json({
      success: true,
      data: couponCounts,
      message: "Top 5 coupon usage",
    });
  } 
  catch(e) {
    console.log(" error ", e);
    next(e);
  }
}

repeatPurchaseRate = async (req, res, next) => {
  try {
    // Step 1: Count customers with more than one subscription
    const customersWithMultipleSubscriptions = await Subscription.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "subscriptionCount"],
      ],
      group: ["customerId"],
      having: Sequelize.literal("COUNT(id) > 1"), // Filter customers with more than one subscription
    });

    // Step 2: Count the total number of unique customers
    const totalCustomers = await Subscription.count({
      distinct: true,
      col: "customerId",
    });

    // Step 3: Calculate the repeat purchase rate
    const repeatPurchaseRate =
      (customersWithMultipleSubscriptions.length / totalCustomers) * 100;

    res.status(200).json({
      success: true,
      data: {
        repeatPurchaseRate: parseFloat(repeatPurchaseRate.toFixed(2)), // Return as a percentage with 2 decimal places
      },
      message: "Repeat purchase rate calculated successfully",
    });
  } catch (e) {
    console.log("Error:", e);
    next(e);
  }
};

pausedOrdersCount = async(req, res, next) => {
  try {
    const pausedOrdersCount = await Order.count({
      where: {
        status: "paused",
      },
    });

    const totaOrdersCount = await Order.count({})

    const pausePercentage = (pausedOrdersCount/totaOrdersCount * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        pausePercentage,
        pausedOrdersCount,
        totaOrdersCount
      },
      message: "Paused orders count",
    });
  } 
  catch(e) {
    console.log(" error ", e);
    next(e);
  }
}

sendMail = async (req, res, next) => {
  const { formType, name, email, phoneNumber, companyName, designation, message } = req.body 
  const payload = {}

  if(formType === "contact") {
    payload.name = name
    payload.email = email
    payload.phoneNumber = phoneNumber
    payload.message = message

    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
      auth: {
        user: "reachout@rootedtoyou.com",
        // pass: "mrby fhmp tbrc jjow",
        pass: "qnpw ekof znxm wyba"
      }
    });
    const toOptions = {
      from: "reachout@rootedtoyou.com", // Sender address
      to: "reachout@rootedtoyou.com", // Recipient address
      subject: SUBJECT.CONTACT, // Subject line
      text: feedbackTemplate(payload), // Plain text body
    }

    transporter.sendMail(toOptions);
  }

  if(formType === "feedback") {
    // send feedback email
    payload.name = name
    payload.email = email
    payload.message = message

    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
      auth: {
        user: "reachout@rootedtoyou.com",
        pass: "mrby fhmp tbrc jjow",
      }
    });
    const toOptions = {
      from: "reachout@rootedtoyou.com", // Sender address
      to: "reachout@rootedtoyou.com", // Recipient address
      subject: SUBJECT.CORPORATE, // Subject line
      text: feedbackTemplate(payload), // Plain text body
    }

    transporter.sendMail(toOptions);
  }

  if(formType === "corporate") {
    // send subscription email
    payload.name = name
    payload.email = email
    payload.phoneNumber = phoneNumber
    payload.companyName = companyName
    payload.designation = designation
    payload.message = message

    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
      auth: {
        user: "bizdev@rootedtoyou.com", // Your email address
        pass: "yczz joax astr ffxf", // Your email password or app-specific password
      },
    });

    const toOptions = {
      from: "bizdev@rootedtoyou.com", // Sender address
      to: "bizdev@rootedtoyou.com", // Recipient address
      subject: SUBJECT.CORPORATE, // Subject line
      text: corporateTemplate(payload), // Plain text body
    }

    transporter.sendMail(toOptions);
  }

  try {
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
}

module.exports = {
  sales,
  revenue,
  subscribers,
  topPerformingZipCodes,
  mostOrderedSubscriptionType,
  mostOrderedCuisineAndMeal,
  couponUsage,
  repeatPurchaseRate,
  pausedOrdersCount,
  sendMail
}
