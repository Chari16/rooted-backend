const Sequelize = require("sequelize");
const db = require("../db/sequelize");
const Address = require("./address");

const Customer = db.define(
  "customers",
  {
		customerNo: {
      type: Sequelize.STRING,
      required: true,
			unique: true,
    },
    firstName: {
      type: Sequelize.STRING,
      required: false,
    },
    lastName: {
      type: Sequelize.STRING,
      required: false,
    },
    email: {
      type: Sequelize.STRING,
      required: false,
      unique: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      required: false,
      unique: true,
    },
    companyName: {
      type: Sequelize.STRING,
      required: false,
    },
    dob: {
      type: Sequelize.DATE,
      required: false,
    },
    address1: {
      type: Sequelize.STRING,
      required: false,
    },
    address2: {
      type: Sequelize.STRING,
      required: false,
    },
    department: {
      type: Sequelize.STRING,
      required: false,
    },
    designation: {
      type: Sequelize.STRING,
      required: false,
    },
    city: {
      type: Sequelize.STRING,
      required: false,
    },
    state: {
      type: Sequelize.STRING,
      required: false,
    },
    pincode: {
      type: Sequelize.STRING,
      required: false,
    },
    status: {
      type: Sequelize.STRING,
      required: true,
    },
    wallet: {
      type: Sequelize.FLOAT,
      required: true,
    },
    otp: {
      type: Sequelize.STRING,
      required: false,
    },
    otpCreatedAt: {
      type: Sequelize.DATE,
      required: false,
    },
    googleId: {
      type: Sequelize.STRING,
      required: false,
    },
    fbId: {
      type: Sequelize.STRING,
      required: false,
    }
  },
  {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["phoneNumber"], // Add an index for the phoneNumber column
      },
    ]
  }
);

Customer.beforeCreate(async (customer, options) => {
  const lastCustomer = await Customer.findOne({
    order: [["createdAt", "DESC"]], // Get the most recently created customer
  });

  if (lastCustomer && lastCustomer.customerNo) {
    // Extract the numeric part and increment it
    const lastNumber = parseInt(lastCustomer.customerNo.replace("ROOTED", ""), 10);
    customer.customerNo = `ROOTED${String(lastNumber + 1).padStart(4, "0")}`;
  } else {
    // If no customers exist, start with ROOTED0001
    customer.customerNo = "ROOTED0001";
  }
});

Customer.hasMany(Address, { foreignKey: "customerId", as: "address" });
Address.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

module.exports = Customer;
