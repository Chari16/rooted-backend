const { Sequelize } = require("sequelize");
const {
  Order,
  MealBox,
  Cuisine,
  Customer,
  Subscription,
} = require("../models");
const { calculateRefund } = require("../utils/formulas");
const Op = Sequelize.Op;

getOrders = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.findAll({
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      include: [
        {
          model: MealBox, // Assuming Box is the model for boxId
          as: "box", // Alias for the association
        },
        {
          model: Cuisine, // Include Cuisine model
          as: "cuisine", // Alias for the association (must match the alias in your Sequelize association)
        },
        {
          model: Subscription, // Include Subscription model
          as: "subscription", // Alias for the association
        },
        { model: Customer, as: "customer" },
      ],
    });
    console.log(" my orders ", orders);
    const myNewList = orders.map((order) => {
      return {
        orderDate: new Date(order.orderDate).toLocaleDateString("en-GB"),
        boxSize: order.box?.name || null,
        dietType: order.subscription?.dietType || null,
        cuisine: order.cuisine,
        customer: order.customer,
      };
    });
    console.log("my new list ", myNewList);

    const allDates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
    }

    const orderMap = {};
    orders.forEach((order) => {
      const dateKey = new Date(order.orderDate).toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
      orderMap[dateKey] = {
        weekday: new Date(order.orderDate).toLocaleDateString("en-GB", {
          weekday: "long",
        }),
        boxSize: order.box?.name || null,
        dietType: order.cuisine?.type || null,
        cuisine: order.cuisine,
        orderDate: dateKey,
      };
    });

    const formattedOrders = {};
    allDates.forEach((date) => {
      const dateKey = date.toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
      formattedOrders[dateKey] = orderMap[dateKey] || {
        weekday: date.toLocaleDateString("en-GB", { weekday: "long" }),
        boxSize: null,
        dietType: null,
        cuisine: null,
        orderDate: dateKey,
      };
    });
    // new Orders json
    // Group orders by subscription ID
    const groupedOrders = {};
    const formattedDates = [];
    allDates.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      formattedDates.push(dateKey);
    });
    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const subscriptionId = order.subscriptionId;

      if (!groupedOrders[subscriptionId]) {
        groupedOrders[subscriptionId] = {
          id: subscriptionId,
          boxSize: order.box?.name || null,
          dietType: order.subscription?.dietType || null,
          cuisineCode: "BSG", // Example cuisine code
        };

        // Initialize all absent date between start and end with null
        allDates.forEach((date) => {
          const dateKey = date.toISOString().split("T")[0]; // Format date as DD/MM/YYYY
          if (!groupedOrders[subscriptionId][dateKey]) {
            groupedOrders[subscriptionId][dateKey] = null;
          }
        });
      }

      // Map the cuisine code to the corresponding date
      groupedOrders[subscriptionId][orderDate] =
        order.cuisine?.name?.charAt(0) || null; // Use the first letter of the cuisine name
    });

    // Convert groupedOrders to an array
    const myOrders = Object.values(groupedOrders);

    res.status(200).json({
      success: true,
      orders: formattedOrders,
      newOrders: myOrders,
      dates: [...formattedDates],
    });
  } catch (e) {
    next(e);
  }
};

getKitchenSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Generate all dates between startDate and endDate
    const allDates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      allDates.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
    }

    // Fetch orders grouped by orderDate and cuisineId
    const ordersGroupedByDate = await Order.findAll({
      attributes: [
        "orderDate", // Include orderDate in the result
        "cuisineId", // Include cuisineId in the result
        [Sequelize.fn("COUNT", Sequelize.col("Orders.id")), "orderCount"], // Count the number of orders
      ],
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      group: ["orderDate", "cuisineId"], // Group by orderDate and cuisineId
      include: [
        {
          model: Cuisine,
          as: "cuisine", // Include the Cuisine model for additional details
          attributes: ["name"], // Include only the name of the cuisine
        },
      ],
    });

    const ordersGroupedByBox = await Order.findAll({ 
      attributes: [
        "boxId", // Include boxId in the result
        [Sequelize.fn("COUNT", Sequelize.col("Orders.id")), "totalOrders"], // Count the number of orders
      ],
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      group: ["boxId"], // Group by boxId
      include: [
        // {
        //   model: Subscription,
        //   as: "subscription", // Include the Cuisine model for additional details
        //   attributes: ["dietType"], // Include only the name of the cuisine
        // },
        {
          model: MealBox,
          as: "box", // Include the Cuisine model for additional details
          attributes: ["name"], // Include only the name of the cuisine
        },
      ]
    })

    const ordersGroupedByDiet = await Order.findAll({
      attributes: [
        "id",
        "subscriptionId", // Include subscriptionId in the result
      ], 
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      include: [
        {
          model: Subscription,
          as: "subscription", 
          attributes: ["dietType"],
        },
      ]
    })

    const vegOrders = ordersGroupedByDiet.filter(order => order.subscription.dietType === "veg").length;
    const nonVegOrders = ordersGroupedByDiet.filter(order => order.subscription.dietType === "non_veg").length;
    const totalOrders = ordersGroupedByDiet.length;

    // Format the response
    const schedule = {};

    // Initialize all cuisines with all dates set to 0
    const cuisines = await Cuisine.findAll({ attributes: ["id", "name"] });
    cuisines.forEach((cuisine) => {
      schedule[cuisine.id] = { cuisineId: cuisine.id, cuisineName: cuisine.name, dates: {} };
      allDates.forEach((date) => {
        schedule[cuisine.id].dates[date] = 0; // Initialize all dates with 0
      });
    });

    ordersGroupedByDate.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const cuisineId = order.cuisineId;
      const orderCount = order.dataValues.orderCount;

      if (schedule[cuisineId]) {
        schedule[cuisineId].dates[orderDate] = orderCount; // Update the count for the date
      }
    });

    // Convert the schedule object to an array
    const formattedSchedule = Object.values(schedule);

    res.status(200).json({
      success: true,
      schedule: formattedSchedule,
      dates: allDates,
      orderByBox: ordersGroupedByBox,
      vegOrders: vegOrders,
      nonVegOrders: nonVegOrders,
      totalOrders
    });
  } catch (e) {
    console.error("Error in getKitchenSchedule:", e);
    next(e);
  }
};

pauseOrder = async (req, res, next) => {
  try {
    // payload -> { subscriptionId, pauseDate, customerId }
    const { subscriptionId, pauseDate, customerId } = req.body;
    console.log(" pause order ", subscriptionId, pauseDate, customerId);
    const month = new Date(pauseDate).getMonth();
    const year = new Date(pauseDate).getFullYear();
    const day = new Date(pauseDate).getDate();
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59));
    const order = await Order.findOne({
      where: {
        subscriptionId,
        orderDate: {[Op.between]: [new Date(startOfDay), new Date(endOfDay)]},
        customerId,
      },
      include: [
        {
          model: Subscription,
          as: "subscription",
          attributes: ["id", "subscriptionType", "amount", "dietType"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "wallet"],
        }
      ],
    });
    console.log(" order ", order.subscription);
    const refund = calculateRefund(order.subscription.subscriptionType, order.subscription.amount);
    console.log(" refund ", refund.toFixed(2));
    if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    await order.update({ status: 'paused' });
    const presentWallet = order.customer.wallet;
    const updatedWallet = presentWallet + refund;
    await Customer.update({ wallet: updatedWallet },{ where: { id: customerId } });
    res.status(200).json({
      success: true,
      message: "Order paused successfully"
    });
  }
  catch(e) {
    next(e)
  }
}

module.exports = {
  getOrders,
  getKitchenSchedule,
  pauseOrder
};
