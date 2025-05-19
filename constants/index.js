const API_VERSION = {
  V1: "v1",
  V2: "v2",
};

const DIET_TYPE = {
  veg: "Vegetarian",
  non_veg: "Non-Vegetarian",
};

const MEAL_SUBSCRIPTION = {
  monthly: "Monthly",
  weekly: "Weekly",
  oneDay: "trial"
};

const WEEKEND_TYPE = {
	none: 'None',
	all: 'All Saturday',
	odd: "1st & 3rd Saturday's",
	even: "2nd & 4rth Saturday's",
}

const LOGIN_TYPE = {
  otp: 'otp',
  google: 'google',
  facebook: 'facebook'
}

const SMS_API_URL = "https://wb.omni.tatatelebusiness.com/whatsapp-cloud/messages";

const DISCOUNT_TYPE = {
  fixed: 'fixed',
  percentage: 'percentage'
}

const SUBJECT = {
  CORPORATE: "New Corporate Plan Inquiry Received!",
  FEEDBACK: "Subscriber Feedback Just in!",
  CONTACT: "New Contact Request!",
  SUBSCRIPTION: "New Subscription confirmed"
}

const ROLE_TYPE = {
  ADMIN: "admin",
  USER: "user",
}

module.exports = {
  API_VERSION,
  DIET_TYPE,
	MEAL_SUBSCRIPTION,
	WEEKEND_TYPE,
  LOGIN_TYPE,
  SMS_API_URL,
  DISCOUNT_TYPE,
  SUBJECT,
  ROLE_TYPE
};
