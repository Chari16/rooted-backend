const logger = require("../logger");
const { WEEKEND_TYPE } = require("../enums");
const Order = require("../models/order");
const Customer = require("../models/customer");
const Transactions = require("../models/transaction");
const Subscription = require("../models/subscription");
const SubscriptionMap = require("../models/subscriptionMap");
const MealBox = require("../models/mealBox");
const Sequelize = require("sequelize");
const { checkHoliday, convertToUTC } = require("../utils/date");
const CircularLinkedList = require("../utils/linkedList");
const { Holiday } = require("../models");
const Address = require("../models/address");
const Op = Sequelize.Op;

// Task to do:
// user can buy subscription
// user get to see his subscription details
// pause subscription for particular days or days

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

create = async (req, res, next) => {
  try {
    await Subscription.create(req.body);
    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

list = async (req, res, next) => {
  console.log(" req params ", req.params);
  const { page, size } = req.query;
  console.log(" page ", page, size);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset);
  const subscriptions = await Subscription.findAll({
    where: {
      customerId: req.params.userId
    },
    limit, offset,
    include: [
      {
        model: MealBox, 
        as: "box",
      },
      {
        model: Address,
        as: 'address'
      }
    ],
    order: [["createdAt", "DESC"]],
   },
  );
  const totalCount = await Subscription.count({
    where: {
      customerId: req.params.userId
    },
  });
  res.status(200).json({
    success: true,
    subscriptions,
    count: totalCount,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalCount / limit),
  });
};

getBoxDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOne({ where: { id } });
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: "Subscription box not found",
      });
    }
    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (e) {
    next(e);
  }
};

updateBoxDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body);
    const { email, password, firstName, lastName, phoneNumber, role, status } =
      req.body;
    const mealBox = await Subscription.findOne({ where: { id } });
    if (!mealBox) {
      return res.status(404).json({
        success: false,
        message: "Meal box not found",
      });
    }
    console.log(" user ", mealBox);
    await Subscription.update(req.body, { where: { id: 1 } });
    res.status(200).json({
      success: true,
      message: "Meal box updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

buySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create(req.body);
    const { cuisineChoice, weekendType, boxId } = req.body;
    let choicesAvailable = false;
    console.log(" cuisineChoice ", cuisineChoice);
    const list = new CircularLinkedList();
    console.log(" initial list ", list)
    if(cuisineChoice && cuisineChoice.length) {
      // populate the linkedlist
      for(let i = 0; i < cuisineChoice.length; i++) { 
        list.append(cuisineChoice[i]);
      }
      choicesAvailable = true;
    }
    console.log(" list ", list);
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    let schedule = [];
    let weekends = [];

    console.log("start Date ", startDate);
    console.log("end Date ", endDate);
    const holidayStartDate = startDate.getDate() - 1
    const holidays = await Holiday.findAll({ where: { date: {[Op.between]: [holidayStartDate, endDate]} }});
    console.log(" holidays ", holidays);

    const isPublicHoliday = (currentDate) => {
      return holidays.some(holiday => {
        const holidayDate = new Date(holiday.date).toISOString().split("T")[0]; // Format holiday date as YYYY-MM-DD
        const currDate = currentDate.toISOString().split("T")[0]; // Format current date as YYYY-MM-DD
        return holidayDate === currDate; // Compare the dates
      })
    }

    if (weekendType == WEEKEND_TYPE.ALL) {
      // holiday on all saturdays
      console.log(" INSIDE ALL ===>")
      let currentNode = list.head;
      while (startDate <= endDate) {
        // console.log(" new start date ", startDate);
        let day = startDate.getDay();

        // check for holiday
        if (day === 6 || day === 0 || isPublicHoliday(startDate)) {
          weekends.push({
            orderDate: new Date(startDate),
            orderStatus: 0,
          });
        } else {
          // console.log(" start date inside else  ", startDate);
          console.log(" currentNode ", currentNode);
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(startDate),
            boxId: boxId,
            cuisineId: currentChoice,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            status: 'active'
          });
          if(choicesAvailable) {
            currentNode = currentNode.next;
          }
        }
        startDate.setDate(startDate.getDate() + 1); // Move to next day
      }

      // return schedule;
    }
    if (weekendType == WEEKEND_TYPE.EVEN) {
      // holiday on 2nd and 4th
      let currentNode = list.head;
      while (startDate <= endDate) {
        let day = startDate.getDay();
        if (day === 6 || day === 0 || isPublicHoliday(startDate)) {
          if (day === 6 || isPublicHoliday(startDate)) {
            const isHoliday = checkHoliday(
              startDate.toISOString().split("T")[0], WEEKEND_TYPE.EVEN
            );
            console.log(" isHoliday ", isHoliday, startDate);
            console.log(" isPublicHoliday ", isPublicHoliday(startDate));
            if (!isHoliday && !isPublicHoliday(startDate)) {
              console.log(" currentNode ", currentNode);
              const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
              schedule.push({
                orderDate: new Date(startDate),
                boxId: boxId,
                cuisineId: currentChoice,
                customerId: subscription.customerId,
                subscriptionId: subscription.id,
                status: 'active'
              });
              if(choicesAvailable) {
                currentNode = currentNode.next;
              }
            }
          } else {
            weekends.push({
              orderDate: new Date(startDate),
              orderStatus: 0,
            });
          }
        } else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(startDate),
            boxId: boxId,
            cuisineId: currentChoice,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            status: 'active'
          });
          if(choicesAvailable) {
            currentNode = currentNode.next;
          }
        }
        startDate.setDate(startDate.getDate() + 1); // Move to next day
      }
    }
    if (weekendType == WEEKEND_TYPE.ODD) {
      console.log(" INSIDE ODD ===>")
      // holiday on 1st and 3rd
      let currentNode = list.head;
      while (startDate <= endDate) {
        let day = startDate.getDay();
        if (day === 6 || day === 0 || isPublicHoliday(startDate)) {
          if (day === 6 || isPublicHoliday(startDate)) {
            const isHoliday = checkHoliday(
              startDate.toISOString().split("T")[0], WEEKEND_TYPE.ODD
            );
            console.log(" isHoliday ", isHoliday);
            if(!isHoliday && !isPublicHoliday(startDate)) {
              const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
              schedule.push({
                orderDate: new Date(startDate),
                boxId: boxId,
                cuisineId: currentChoice,
                customerId: subscription.customerId,
                subscriptionId: subscription.id,
                status: 'active'
              });
              if(choicesAvailable) {
                currentNode = currentNode.next;
              }
            }
          } else {
            weekends.push({
              orderDate: new Date(startDate),
              orderStatus: 0,
            });
          }
        } else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(startDate),
            boxId: boxId,
            cuisineId: currentChoice,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            status: 'active'
          });
          if(choicesAvailable) {
            currentNode = currentNode.next;
          }
        }
        startDate.setDate(startDate.getDate() + 1); // Move to next day
      }
    }
    if (weekendType == WEEKEND_TYPE.NONE) {
      // only sunday holiday
      let currentNode = list.head;
      while (startDate <= endDate) {
        let day = startDate.getDay();
        if(day === 0 || isPublicHoliday(startDate)) {
          // push everything in weekends
          weekends.push({
            orderDate: new Date(startDate),
            orderStatus: 0,
          });
        }
        else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(startDate),
            boxId: boxId,
            cuisineId: currentChoice,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            status: 'active'
          });
          if(choicesAvailable) {
            currentNode = currentNode.next;
          }
        }
        startDate.setDate(startDate.getDate() + 1); // Move to next day
      }
    }
    console.log(" schedule ", schedule);
    console.log(" weekends ", weekends);
    // if(cuisineChoice && cuisineChoice.length) {
    //   const choiceMap = []
    //   for(let i = 0; i < cuisineChoice.length; i++) {
    //     choiceMap.push({ cuisineId: cuisineChoice[i], subscriptionId: subscription.id });
    //   }
    //   await SubscriptionMap.bulkCreate(choiceMap);
    // }
    // order creation process
    // Need to create order for whole month / week
    // loop through start and end date
    // evaluate type of saturdays selected
    // and add order for those saturdays
    // don't schedule order for sunday
    // while scheduling maintain the order of the cuisine as stored
    // for subscription with random cuisine, no cuisine id to be allocated


    // await Order.bulkCreate(schedule);

    res.status(200).json({
    	success: true,
    	message: "Subscription created successfully",
    	data: subscription
    });
  } catch (e) {
    logger.error(`Error Buying subscriptions for userId: ${req.customerId} - ${e.message}`);
    next(e);
  }
};

getUserSubscriptions = async (req, res, next) => {
  const { userId } = req.params;
  const { page = 0, size = 10 } = req.query;
  try {
    console.log(" page ", page, size);
    const { limit, offset } = getPagination(page, size);
    console.log(" limit ", limit);
    console.log("offset", offset);
    const subscriptions = await Subscription.findAll({ where: { customerId: userId }, limit, offset });
    const totalCount = await Subscription.count({ where: { customerId: userId } });
    res.status(200).json({
      success: true,
      subscriptions,
      count: totalCount,
      currentPage: page ? +page : 0,
      totalPages: Math.ceil(totalCount / limit),
    });
  }
  catch(e) {
    logger.error(`Error fetching subscriptions for userId: ${userId} - ${e.message}`);
    next(e);
  }
};

getActiveSubscription = async (req, res, next) => {
  const { startDate, deliveryType } = req.body;
  const { id } = req.params;
  try {

    const convertedStartDate = convertToUTC(startDate)
    // find any subscription for which we have conflicting start date and end date
    const subscription = await Subscription.findOne({
      where: { customerId: id, status: 'active', deliveryType},
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
    });
    // check if endDate is greater than current date
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription for this user",
        status: "no_subscriptions",
      });
    }
    if(subscription) {
      // check if the existing subscription startDate and endDate is between the new start date 
      if(new Date(subscription.startDate) <= new Date(convertedStartDate) && new Date(subscription.endDate) >= new Date(convertedStartDate)) {
        return res.status(200).json({
          success: true,
          status: 'active',
          message: "Subscription already active",
          subscription,
        });
      }
    }
    if (subscription && new Date(subscription.endDate) > new Date(startDate)) {
      return res.status(200).json({
        success: true,
        status: 'expired',
        message: "Subscription expired",
        subscription,
      });
    }
    res.status(200).json({
      success: true,
      status: 'active',
      subscription,
    });
  }
  catch(e) {
    logger.error(`Error fetching active subscription for userId: ${id} - ${e.message}`);
    next(e)
  }
};

cancelSubscription = async (req, res, next) => {
  const { id } = req.params;
  const subscription = await Subscription.findOne({ where: { id } });
  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: "Subscription not found",
    });
  }

  const transaction = await Transactions.findOne({ orderId: subscription.orderId });
  const  { amount, walletAdjusted } = transaction
  const totalAmount = amount + walletAdjusted
  // retrieve all order for this subscription id for which order date is greater than current date
  const currentDate = new Date();
  const orders = await Order.findAll({
    where: {
      subscriptionId: id,
      orderDate: {
        [Op.gt]: currentDate,
      },
    },
  });
  if (!orders || orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No orders found for this subscription",
    });
  }
  // calculate the refund for remaining orders
  let refund = 0;

  if(subscription.subscriptionType === 'weekly') {
    // calculate the refund for remaining weeks
    refund = (totalAmount / 6) * orders.length;
  }
  if(subscription.subscriptionType === 'monthly') {
    // calculate the refund for remaining months
    refund = (totalAmount / 26) * orders.length;
  }
  // update users wallet with refund amount
  await Customer.update({ wallet: refund }, { where: { id: subscription.customerId } });

  // update the order status to inactive
  for (let i = 0; i < orders.length; i++) {
    await orders[i].update({ status: 'inactive' });
  }

  await subscription.update({ status: 'inactive' });

  res.status(200).json({
    success: true,
    message: "Subscription cancelled successfully",
  });
}

module.exports = {
  create,
  list,
  getBoxDetails,
  updateBoxDetails,
  buySubscription,
  getUserSubscriptions,
  getActiveSubscription,
  cancelSubscription
};
