const calculateRefund = (type, amount) => {
  if (type === "weekly") {
    // total days 30
		// calculate refund by dividing total by 7 days
		const part = amount / 7;
		return part
  }
  if (type === "monthly") {
		// total days 26
		// calculate refund by dividing total by 30 days
    const part = amount / 26;
		return part
  }
  return total - refund;
};

module.exports = {
  calculateRefund,
};
