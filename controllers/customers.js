const { Sequelize } = require("sequelize");
const axios = require("axios");
const User = require("../models/user");
const Customer = require("../models/customer");
const { SMS_API_URL } = require("../constants");
const { verify } = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { generateJwtToken } = require("../utils/authorization");

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
    // check if user exists by email
    const customer = await Customer.findOne({
      where: { phoneNumber: req.body.phoneNumber },
    });
    if (customer) {
      return res.status(403).json({
        success: false,
        message: "Customer already exists",
      });
    }
    await Customer.create({ ...req.body, status: "active", wallet: 0 });
    res.status(200).json({
      success: true,
      message: "Customer created successfully",
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
  const customers = await Customer.findAll({ limit, offset });
  const totalCustomers = await Customer.count();
  res.status(200).json({
    success: true,
    customers,
    count: totalCustomers,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalCustomers / limit),
  });
};

getCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ where: { id } });
    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (e) {
    next(e);
  }
};

updateCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body);
    const user = await Customer.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    console.log(" user ", user);
    await Customer.update(
      req.body,
      { where: { id: id } }
    );
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

// Flow
// user sends phone number for login
// we create a new customer if not exists with the phone number
// we need to register this phoneNumber along with a otp with expiration
// we will send the otp to the user through whatsapp api
// user again sends otp along with phoneNumber for verification -> will need another api for that
// if otp is verified, we will send the customer details
// if not, we will send a message that otp is invalid
login = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    // generate otp logic here
    // check if phone number is valid
    if(phoneNumber.length !== 10) { 
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const customer = await Customer.findOne({
      where: {
        phoneNumber: phoneNumber, // Condition for phoneNumber
      },
    });

    console.log(" customer ", customer);
    if (!customer) {
      // create a new customer
      await Customer.create({
        phoneNumber,
        status: "inactive",
        wallet: 0,
        otp,
        otpCreatedAt: new Date(),
      });
    }
    else {
      // update the otp
      await Customer.update(
        {
          otp,
          otpCreatedAt: new Date(),
        },
        {
          where: {
            phoneNumber: phoneNumber,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });


    const data = {
      "to": `91${phoneNumber}`,
      "type": "template",
      "template": {
        "name": "otp",
        "language": {
          "code": "en"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": otp
              }
            ]
          },
          {
            "type": "button",
            "sub_type": "url",
            "index": "0",
            "parameters": [
              {
                "type": "text",
                "text": otp
              }
            ]
          }
        ]
      }
    }
    const options = {
      headers: {
        "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTE4MDAyNjgwMjY4IiwicGhvbmVOdW1iZXJJZCI6IjQzMTA1NDI3Njc2MTIzNCIsImlhdCI6MTcyNTQ0MjIxNn0.uPzfqN0f1eipWOG3TCH-wsBhk9YXDisqJ31mv_nSHWI",
        "Content-Type": "application/json",
        "accept": "application/json",
       },
    }
    try {
      const resp = await axios.post(SMS_API_URL, data, options);
      console.log(" resp ", resp)
      res.status(200).json({
        message: "OTP sent successfully"
      })
    }
    catch (apiError) {
      console.error("Error calling SMS API:", apiError.message);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (e) {
    next(e);
  }
};

googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log(" ticket ", ticket.getPayload());
    // generate jwt token
    const { email, sub, name } = ticket.getPayload();
    const customer = await Customer.findOne({
      where: {
        email: email,
        googleId: sub,
      },
    });
    if (!customer) {
      // create a customer with name and email
      const newCustomer = await Customer.create({
        name,
        email,
        googleId: sub,
        status: "active",
        wallet: 0,
      });
      const token = await generateJwtToken(newCustomer);
      res.status(200).json({
        success: true,
        message: "Google login success with new customer",
        token: token,
      });
    }
    // generate jwt token
    const jwtToken = await generateJwtToken(customer);
    res.status(200).json({
      success: true,
      message: "Google login success",
      token: jwtToken,
    });
  } catch (e) {
    next(e);
  }
};

facebookLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    console.log(" fb response ", fbResponse.data);
    const { id, name, email, picture } = fbResponse.data;
    // generate jwt token
    const customer = await Customer.findOne({
      where: {
        email: email,
        fbId: id,
      },
    });
    if (!customer) {
      // create a customer with name and email
      const newCustomer = await Customer.create({
        name,
        email,
        fbId: id,
        status: "active",
        wallet: 0,
      });
      const token = await generateJwtToken(newCustomer);
      res.status(200).json({
        success: true,
        message: "Facebook login success with new customer",
        token: token,
      });
    }
    // generate jwt token
    const token = await generateJwtToken(customer);
    res.status(200).json({
      success: true,
      message: "Facebook login success",
      token: token,
    });
  } catch (e) {
    next(e);
  }
};

verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    const customer = await Customer.findOne({
      where: {
        phoneNumber: phoneNumber,
        otp: otp,
      },
      attributes: { exclude: ["googleId", "fbId"] },
    });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    // verify if otp is valid
    const otpCreatedAt = new Date(customer.otpCreatedAt);
    const currentTime = new Date();
    const diff = currentTime - otpCreatedAt;
    if (diff > 120000) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    // format response
    const customerData = customer.toJSON();
    delete customerData.otp;

    // generate jwt token
    const token = await generateJwtToken(customer);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: customerData,
      token: token,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  register,
  search,
  login,
  create,
  list,
  getCustomerDetails,
  updateCustomerDetails,
  login,
  googleLogin,
  facebookLogin,
  verifyOtp
};
