const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const { WEEKEND_TYPE } = require("../enums");
const Transaction = require("../models/transaction");
const Razorpay = require("razorpay");
const crypto = require('crypto');
const TempSubscription = require("../models/tempSubscription");
const { Subscription, Holiday, Order, MealBox, Customer } = require("../models");
const CircularLinkedList = require("../utils/linkedList");
const { checkHoliday, convertToUTC } = require("../utils/date");
const Address = require("../models/address");
const { subscriberTemplate } = require("../utils/mailTransporter");
const { SUBJECT } = require("../constants");
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
    const { amount, gst, shippingAmount, discount, customerId,
      subscriptionType,
      boxId,
      dietType,
      weekendType,
      deliveryType, //lunch or dinner
      cuisineChoice,
      startDate,
      endDate,
      status,
      itemCode,
      itemNames,
      walletAmount,
      couponCode,
      selectedDates, // [] of string
      address1,
      address2,
      department,
      designation,
      city,
      state,
      pincode,
    } = req.body;
    // add new customer address entry here - todo
    // later we can use values from payload
    const address = await Address.create({ 
      address1: "test",
      address2: "test",
      department: "test",
      designation: "test",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400002",
    });

    const subscription = await Subscription.findOne({
      where: { customerId: customerId, status: 'active' },
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
    });
    console.log(" subscription ===> ", subscription);
    // check if endDate is greater than current date
    const newSubStartDate = new Date(startDate);
    console.log(" newSubStartDate ", newSubStartDate);
    console.log(" subscription end date ", subscription && new Date(subscription.endDate));
    if (subscription && new Date(subscription.endDate) > newSubStartDate) {
      console.log(" inside check block ")
      return res.status(200).json({
        success: true,
        message: "Already have active subscription for this time period",
        subscription,
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await instance.orders.create({ amount: amount * 100, currency: "INR" });
    await TempSubscription.create({
      amount,
      customerId,
      subscriptionType,
      boxId,
      dietType,
      deliveryType, //lunch or dinner
      weekendType,
      cuisineChoice,
      startDate,
      endDate,
      status,
      itemCode,
      itemNames,
      orderId: order.id,
      selectedDates,
      addressId: address.id,
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

createNewOrder = async (req, res, next) => {
  try {
    const { amount, orderAmount, gst, shippingAmount, discount, customerId,
      subscriptionType,
      boxId,
      dietType,
      weekendType,
      deliveryType, //lunch or dinner
      cuisineChoice,
      startDate,
      endDate,
      status,
      itemCode,
      itemNames,
      walletAmount,
      couponCode,
      selectedDates,// [] of string
      address1,
      address2,
      department,
      designation,
      city,
      state,
      pincode,
    } = req.body;
    console.log(" selected dates ", selectedDates)
    // add new customer address entry here - todo
    // later we can use values from payload
    const address = await Address.create({ 
      address1: address1,
      address2: address2,
      department: "test",
      designation: "test",
      city: city,
      state: "Maharashtra",
      pincode: pincode,
    });

    const subscription = await Subscription.findOne({
      where: { customerId: customerId, status: 'active', deliveryType, },
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
    });
    console.log(" subscription ===> ", subscription); 
    const newSubStartDate = convertToUTC(startDate);
    // console.log(" newSubStartDate ", newSubStartDate);
    // console.log(" subscription end date ", subscription && new Date(subscription.endDate));
    if(subscription) {
      if(new Date(subscription.startDate) <= new Date(newSubStartDate) && new Date(subscription.endDate) >= new Date(newSubStartDate)) { 
        return res.status(200).json({
          success: false,
          message: "Already have active subscription for this time period",
          subscription,
        });
      }
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await instance.orders.create({ amount: amount * 100, currency: "INR" });
    await TempSubscription.create({
      amount,
      customerId,
      subscriptionType,
      boxId,
      dietType,
      deliveryType,
      weekendType,
      cuisineChoice,
      startDate: convertToUTC(startDate),
      endDate: convertToUTC(endDate),
      status,
      itemCode,
      itemNames,
      orderId: order.id,
      selectedDates,
      addressId: address.id,
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
      couponCode,
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
    const transaction = await Transaction.findOne({
      where: { orderId: orderCreationId },
    });

    const customer = await Customer.findOne({
      where: { id: transaction.customerId },
    });

    await TempSubscription.update(
      { orderId: orderCreationId, status: 'active' },
      { where: { orderId: orderCreationId } }
    );
    const tempSub = await TempSubscription.findOne({
      where: { orderId: orderCreationId }
    });
    console.log(" tempSub ", tempSub);
    // get address details
    const address = await Address.findOne({ where: { id: tempSub.addressId } });
    // getb box details
    const box = await MealBox.findOne({ where: { id: tempSub.boxId } });

    const {amount, weekendType, status, boxId, itemNames, subscriptionType, dietType, deliveryType, startDate, endDate, customerId, itemCode, orderId, selectedDates  } = tempSub
    const subscription = await Subscription.create({ amount, weekendType, status, boxId, itemNames, subscriptionType, deliveryType, dietType, startDate: convertToUTC(startDate), endDate: convertToUTC(endDate), customerId, itemCode, orderId, cuisineChoice: tempSub.cuisineChoice, selectedDates, transactionId: transaction.id, addressId: tempSub.addressId });

    await Customer.update({ wallet: customer.wallet - transaction.walletAdjusted }, { where: { id: transaction.customerId } });

    // trigger the buy subscription flow here
    const cuisineChoice = tempSub.cuisineChoice;
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

    // mail trigger logic
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
      text: subscriberTemplate(customer, address, subscription, box), // Plain text body
    }

    transporter.sendMail(toOptions);
    // mail logic ends

    // new logic of creating orders with selected dates
    const dates = subscription.selectedDates;

    // loop through dates to create array of orders
    const orders = [];
    let currHead = list.head;
    for(let i = 0; i < dates.length; i++) {
      const orderDate = new Date(dates[i]);
        const currentChoice = choicesAvailable ? list.getCurrentValue(currHead) : null;
        orders.push({
          orderDate: orderDate,
          boxId: boxId,
          cuisineId: currentChoice,
          customerId: subscription.customerId,
          subscriptionId: subscription.id,
          status: 'active'
        });
        if(choicesAvailable) {
          currHead = currHead.next;
        }
    }
    // bulk create Orders
    await Order.bulkCreate(orders);
    return res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
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

oldPaymentSuccess = async (req, res, next) => {
      // getting the details back from our font-end
      const {
        orderCreationId,
        razorpayPaymentId,
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
      const transaction = await Transaction.findOne({
        where: { orderId: orderCreationId },
      });
  
      const customer = await Customer.findOne({
        where: { id: transaction.customerId },
      });
  
      await TempSubscription.update(
        { orderId: orderCreationId, status: 'active' },
        { where: { orderId: orderCreationId } }
      );
      const tempSub = await TempSubscription.findOne({
        where: { orderId: orderCreationId },
      });
      console.log(" tempSub ", tempSub);
  
      const {amount, weekendType, status, boxId, itemNames, subscriptionType, dietType, deliveryType, startDate, endDate, customerId, itemCode, orderId  } = tempSub
      const subscription = await Subscription.create({ amount, weekendType, status, boxId, itemNames, subscriptionType, deliveryType, dietType, startDate, endDate, customerId, itemCode, orderId, cuisineChoice: tempSub.cuisineChoice });
  
      await Customer.update({ wallet: customer.wallet - transaction.walletAdjusted }, { where: { id: transaction.customerId } });
  
      // trigger the buy subscription flow here
      const cuisineChoice = tempSub.cuisineChoice;
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
  
  console.log(" payment success ");
  const subStartDate = new Date(subscription.startDate);
  const subEndDate = new Date(subscription.endDate);
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
}

getRevenue = async (req, res, next) => {
  try {
    const { period } = req.query; // Accept 'daily', 'weekly', or 'monthly' as a query parameter

    let groupByFormat;
    switch (period) {
      case "daily":
        groupByFormat = Sequelize.fn("DATE", Sequelize.col("createdAt")); // Group by day
        break;
      case "weekly":
        groupByFormat = Sequelize.fn("YEARWEEK", Sequelize.col("createdAt")); // Group by week
        break;
      case "monthly":
        groupByFormat = Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"); // Group by month
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid period. Use 'daily', 'weekly', or 'monthly'.",
        });
    }

    // Query to calculate total revenue
    const revenueData = await Transaction.findAll({
      attributes: [
        [groupByFormat, "period"], // Group by the selected period
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalRevenue"], // Sum the revenue
      ],
      group: "period", // Group by the calculated period
      order: [[Sequelize.literal("period"), "ASC"]], // Order by period
    });

    res.status(200).json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    next(error);
  }
};

module.exports = {
  list,
  createOrder,
  createNewOrder,
  webhook,
  paymentSuccess,
  paymentFailed,
  getRevenue
};
