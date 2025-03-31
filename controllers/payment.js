const Sequelize = require("sequelize");
const { WEEKEND_TYPE } = require("../enums");
const Transaction = require("../models/transaction");
const Razorpay = require("razorpay");
const crypto = require('crypto');
const TempSubscription = require("../models/tempSubscription");
const { Subscription, Holiday, Order, MealBox, Customer } = require("../models");
const CircularLinkedList = require("../utils/linkedList");
const { checkHoliday } = require("../utils/date");
const Op = Sequelize.Op;

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
;
    const customer = await Customer.findOne({
      where: { id: req.body.customerId },
    });

    const { amount, gst, shippingAmount, discount, customerId,
      subscriptionType,
      boxId,
      dietType,
      weekendType,
      cuisineChoice,
      startDate,
      endDate,
      status,
      itemCode,
      itemNames,
      walletAmount,
      couponCode
     } = req.body;
     if(walletAmount) {
      if(walletAmount > 0) {
        await Customer.update({ wallet: customer.wallet - walletAmount }, { where: { id: customerId } });
      }
     }
    const order = await instance.orders.create({ amount, currency: "INR" });
    await TempSubscription.create({
      amount,
      customerId,
      subscriptionType,
      boxId,
      dietType,
      weekendType,
      cuisineChoice,
      startDate,
      endDate,
      status,
      itemCode,
      itemNames,
      orderId: order.id,
    });
    await Transaction.create({
      customerId: customerId,
      orderId: order.id,
      status: "created",
      amount: amount,
      gst: gst,
      shippingAmount: shippingAmount,
      discount: discount,
      walletAdjusted: walletAmount,
      couponCode
    });

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
    
    await Transaction.update(
      { status: "completed", razorpayPaymentId },
      { where: { orderId: orderCreationId } }
    );
    await TempSubscription.update(
      { orderId: orderCreationId, status: 'active' },
      { where: { orderId: orderCreationId } }
    );
    const tempSub = await TempSubscription.findOne({
      where: { orderId: orderCreationId },
    });
    console.log(" tempSub ", tempSub);

    const {amount, weekendType, status, boxId, itemNames, subscriptionType, dietType, startDate, endDate, customerId, itemCode, orderId  } = tempSub
    const subscription = await Subscription.create({ amount, weekendType, status, boxId, itemNames, subscriptionType, dietType, startDate, endDate, customerId, itemCode, orderId })

    // trigger the buy subscription flow here
    const { cuisineChoice } = req.body;
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
    const subStartDate = new Date(req.body.startDate);
    const subEndDate = new Date(req.body.endDate);
    let schedule = [];
    let weekends = [];

    console.log("start Date ", subStartDate);
    console.log("end Date ", subEndDate);
    const holidayStartDate = subStartDate.getDate() - 1
    const holidays = await Holiday.findAll({ where: { date: {[Op.between]: [holidayStartDate, subEndDate]} }});
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
      while (subStartDate <= subEndDate) {
        // console.log(" new start date ", startDate);
        let day = startDate.getDay();

        // check for holiday
        if (day === 6 || day === 0 || isPublicHoliday(subStartDate)) {
          weekends.push({
            orderDate: new Date(subStartDate),
            orderStatus: 0,
          });
        } else {
          // console.log(" start date inside else  ", startDate);
          console.log(" currentNode ", currentNode);
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(subStartDate),
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
        subStartDate.setDate(subStartDate.getDate() + 1); // Move to next day
      }

      // return schedule;
    }
    if (weekendType == WEEKEND_TYPE.EVEN) {
      // holiday on 2nd and 4th
      let currentNode = list.head;
      while (subStartDate <= subEndDate) {
        let day = subStartDate.getDay();
        if (day === 6 || day === 0 || isPublicHoliday(subStartDate)) {
          if (day === 6 || isPublicHoliday(subStartDate)) {
            const isHoliday = checkHoliday(
              subStartDate.toISOString().split("T")[0], WEEKEND_TYPE.EVEN
            );
            console.log(" isHoliday ", isHoliday, subStartDate);
            console.log(" isPublicHoliday ", isPublicHoliday(subStartDate));
            if (!isHoliday && !isPublicHoliday(subStartDate)) {
              console.log(" currentNode ", currentNode);
              const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
              schedule.push({
                orderDate: new Date(subStartDate),
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
              orderDate: new Date(subStartDate),
              orderStatus: 0,
            });
          }
        } else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(subStartDate),
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
        subStartDate.setDate(subStartDate.getDate() + 1); // Move to next day
      }
    }
    if (weekendType == WEEKEND_TYPE.ODD) {
      console.log(" INSIDE ODD ===>")
      // holiday on 1st and 3rd
      let currentNode = list.head;
      while (subStartDate <= subEndDate) {
        let day = subStartDate.getDay();
        if (day === 6 || day === 0 || isPublicHoliday(subStartDate)) {
          if (day === 6 || isPublicHoliday(subStartDate)) {
            const isHoliday = checkHoliday(
              subStartDate.toISOString().split("T")[0], WEEKEND_TYPE.ODD
            );
            console.log(" isHoliday ", isHoliday);
            if(!isHoliday && !isPublicHoliday(subStartDate)) {
              const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
              schedule.push({
                orderDate: new Date(subStartDate),
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
              orderDate: new Date(subStartDate),
              orderStatus: 0,
            });
          }
        } else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(subStartDate),
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
        subStartDate.setDate(subStartDate.getDate() + 1); // Move to next day
      }
    }
    if (weekendType == WEEKEND_TYPE.NONE) {
      // only sunday holiday
      let currentNode = list.head;
      while (subStartDate <= subEndDate) {
        let day = subStartDate.getDay();
        if(day === 0 || isPublicHoliday(subStartDate)) {
          // push everything in weekends
          weekends.push({
            orderDate: new Date(subStartDate),
            orderStatus: 0,
          });
        }
        else {
          const currentChoice = choicesAvailable ? list.getCurrentValue(currentNode) : null;
          schedule.push({
            orderDate: new Date(subStartDate),
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
        subStartDate.setDate(subStartDate.getDate() + 1); // Move to next day
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


    await Order.bulkCreate(schedule);

    res.status(200).json({
    	success: true,
    	message: "Subscription created successfully",
    	data: subscription
    });




    // -> logic ends here
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

    await TempSubscription.update({ status: "failed" }, { where: { orderId } });

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
