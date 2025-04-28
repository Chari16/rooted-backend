const nodemailer = require("nodemailer");

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "bhaveshchari1997@gmail.com", // Your email address
    pass: "bidx msen fxnk phtd", // Your email password or app-specific password
  },
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("Error verifying transporter:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});


export { transporter };