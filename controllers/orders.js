const { Sequelize } = require("sequelize");
const ExcelJS = require('exceljs');
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

getOrdersList = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      orders,
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

    // Fetch orders grouped by orderDate and dietType
    const ordersGroupedByDietType = await Order.findAll({
      attributes: [
        "orderDate", // Include orderDate in the result
        [Sequelize.col("subscription.dietType"), "dietType"], // Include dietType from Subscription
        [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "itemCount"], // Count the number of items
      ],
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      group: ["orderDate", "subscription.dietType"], // Group by orderDate and dietType
      include: [
        {
          model: Subscription,
          as: "subscription", // Include the Subscription model
          attributes: [], // Exclude other fields from Subscription
        },
      ],
    });

    // Initialize a map to store veg and non-veg counts for each date
    const dietTypeCounts = {};
    const dietTypes = [{name: 'Veg', id: 'veg'}, {name: 'Non Veg', id: 'non_veg'}];
    dietTypes.forEach((dietType) => {
      dietTypeCounts[dietType.id] = { name: dietType.name, dates: {} }; 
      allDates.forEach((date) => {
        console.log(" diet tYpe ", dietType)
        dietTypeCounts[dietType.id].dates[date] =  0; // Initialize counts for each date
      });
    })

    // Populate the dietTypeCounts map with data from the query
    ordersGroupedByDietType.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const dietType = order.dataValues.dietType; // Map dietType to veg or nonVeg
      const dietCount = order.dataValues.itemCount; // Get the count for the diet type
      if(dietTypeCounts[dietType]) {
        dietTypeCounts[dietType].dates[orderDate] = dietCount; // Update the count for the date
      }
    });

    // Fetch orders grouped by orderDate and cuisineId
    const ordersGroupedByDate = await Order.findAll({
      attributes: [
        "orderDate", // Include orderDate in the result
        "cuisineId", // Include cuisineId in the result
        [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "orderCount"], // Count the number of orders
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

    // Fetch orders grouped by orderDate and boxId
    const ordersGroupedByMealBox = await Order.findAll({
      attributes: [
        "orderDate", // Include orderDate in the result
        "boxId", // Include boxId in the result
        [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "boxCount"], // Count the number of orders for each box
      ],
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      group: ["orderDate", "boxId"], // Group by orderDate and boxId
      include: [
        {
          model: MealBox,
          as: "box", // Include the MealBox model
          attributes: ["name"], // Include the name of the meal box
        },
      ],
    });

    // Fetch orders grouped by deliveryType
    const ordersGroupedByDeliveryType = await Order.findAll({
      attributes: [
        "orderDate", // Include orderDate in the result
        [Sequelize.col("subscription.deliveryType"), "deliveryType"], // Include deliveryType in the result
        [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "orderCount"], // Count the number of orders for each delivery type
      ],
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      group: ["orderDate", "subscription.deliveryType"], // Group by orderDate and deliveryType
      include: [
        {
          model: Subscription,
          as: "subscription", // Include the Subscription model
          attributes: [], // Include the deliveryType of the subscription
        }
      ],
    });

    // meal time counts
    const mealTimeCounts = {};
    const mealTypes = [{name: 'Lunch', id: 'lunch'}, {name: 'Dinner', id: 'dinner'}];
    mealTypes.forEach((mealType) => {
      mealTimeCounts[mealType.id] = { name: mealType.name, dates: {} }; 
      allDates.forEach((date) => {
        mealTimeCounts[mealType.id].dates[date] =  0; // Initialize counts for each date
      });
    })
    // Populate the mealTimeCounts map with data from the query
    ordersGroupedByDeliveryType.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const deliveryType = order.dataValues.deliveryType; // Map deliveryType to lunch or dinner
      const orderCount = order.dataValues.orderCount; // Get the count for the delivery type
      if(mealTimeCounts[deliveryType]) {
        mealTimeCounts[deliveryType].dates[orderDate] = orderCount; // Update the count for the date
      }
    });

    // Initialize all cuisines with all dates set to 0
    const mealBoxCounts = {};
    const mealBoxes = await MealBox.findAll({ attributes: ["id", "name"] });
    mealBoxes.forEach((box) => {
      mealBoxCounts[box.id] = { boxId: box.id, boxName: box.name, dates: {} };
      allDates.forEach((date) => {
        mealBoxCounts[box.id].dates[date] = 0; // Initialize all dates with 0
      });
    });

    // Populate the mealBoxCounts map with data from the query
    ordersGroupedByMealBox.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const boxId = order.boxId;
      const boxCount = order.dataValues.boxCount; // Get the count for the box
      if (mealBoxCounts[boxId]) {
        mealBoxCounts[boxId].dates[orderDate] = boxCount; // Update the count for the date
      }
    })

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

    const totalOrders = {};
    allDates.forEach((date) => {
      const dateKey = new Date(date).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      totalOrders[dateKey] = 0; // Initialize total orders for each date
    });
    ordersGroupedByDate.forEach((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const orderCount = order.dataValues.orderCount;
      totalOrders[orderDate] += orderCount; // Update the total orders for the date
    });

    // Convert the schedule object to an array
    const formattedSchedule = Object.values(schedule);

    res.status(200).json({
      success: true,
      schedule: formattedSchedule,
      dates: allDates,
      orderByBox: Object.values(mealBoxCounts),
      totalOrders,
      dietTypeCounts: Object.values(dietTypeCounts),
      mealTimeCounts: Object.values(mealTimeCounts),
    });
  } catch (e) {
    console.error("Error in getKitchenSchedule:", e);
    next(e);
  }
};

pauseOrder = async (req, res, next) => {
  try {
    // payload -> { subscriptionId, pauseDate, customerId }
    const { subscriptionId, pauseDate, customerId, orderId } = req.body;
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

downloadOrdersExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Fetch orders (same logic as getOrdersList)
    const orders = await Order.findAll({
      where: {
        orderDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
        },
      },
      include: [
        {
          model: MealBox,
          as: 'box',
        },
        {
          model: Cuisine,
          as: 'cuisine',
        },
        {
          model: Subscription,
          as: 'subscription',
        },
        {
          model: Customer,
          as: 'customer',
        },
      ],
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Add headers to the worksheet
    worksheet.columns = [
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Box Size', key: 'boxSize', width: 20 },
      { header: 'Diet Type', key: 'dietType', width: 20 },
      { header: 'Cuisine', key: 'cuisine', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 30 },
    ];

    // Add rows to the worksheet
    orders.forEach((order) => {
      worksheet.addRow({
        orderDate: new Date(order.orderDate).toLocaleDateString('en-GB'),
        boxSize: order.box?.name || 'N/A',
        dietType: order.subscription?.dietType || 'N/A',
        cuisine: order.cuisine?.name || 'N/A',
        customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      });
    });

    // Set the response headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=orders.xlsx'
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrdersList,
  getKitchenSchedule,
  pauseOrder,
  downloadOrdersExcel
};
