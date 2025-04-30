const corporateTemplate = (payload) => {
 return `
  Hey Team,
  Someone is craving for Rooted's Meals at their workplace.
  A user has expressed interest in our corporate meal plans. Here's what they shared: 

  - Name: ${payload.name}
  - Email: ${payload.email}
  - Phone Number: ${payload.phoneNumber || "N/A"}
  - Company Name: ${payload.companyName || "N/A"}
  - Designation: ${payload.designation || "N/A"}
  - Message: ${payload.message}

  Let's get in touch and bring Rooted to their office!.
 `
}

const contactUsTemplate = (payload) => {
  return `
    Hi Team,
    Someone just reached out via our contact form. Time to say hello!
 
    - Name: ${payload.name}
    - Email: ${payload.email}
    - Phone Number: ${payload.phoneNumber || "N/A"}
    - Message: ${payload.message}
 
    Let’s respond and keep the Rooted experience fresh!
  `
}

const feedbackTemplate = (payload) => {
  return `
    Hey Team,
    A Your Rooted subscriber just shared their thoughts on our meal!
 
    - Name: ${payload.name}
    - Email: ${payload.email}
    - Phone Number: ${payload.phoneNumber || "N/A"}
    - Feedback: ${payload.feedback}
 
    Great chance to improve and delight, let’s give it a read.
  `
}

const subscriberTemplate = (customer, address, subscriber, box) => {
  const startDate = new Date(subscriber.startDate);
  const endDate = new Date(subscriber.endDate);
  const formattedStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
  const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
  return `
    Hi there,
    Congratulations!!! A new member has subscribed to join our community. Their details are as follows:

    Customer Details:

    - Name: ${customer.firstName} ${customer.lastName}
    - Email: ${customer.email}
    - Phone Number: ${customer.phoneNumber || "N/A"}
    - Company Name: ${customer.companyName || "N/A"}
    - Designation: ${customer.designation || "N/A"}
    - Address: ${address.address1} ${address.address2}
    - City: ${address.city || "N/A"}
    - State: ${address.state || "N/A"}
    - Pin Code: ${address.pincode || "N/A"}

    Subscription Details:
    - Subscription Type: ${subscriber.subscriptionType}
    - Weekend Type: ${subscriber.weekendType}
    - Diet Type: ${subscriber.dietType}
    - Start Date: ${formattedStartDate}
    - End Date: ${formattedEndDate}
    - Amount: ${subscriber.amount}
    - Box Name: ${box.name}
    - Cuisine Names: ${subscriber.itemNames}


    Let's make sure they have a truly wonderful experience.
  `
}

module.exports = {
  corporateTemplate,
  contactUsTemplate,
  feedbackTemplate,
  subscriberTemplate
}