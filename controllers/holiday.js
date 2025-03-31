const Holiday = require("../models/holiday");
const Sequelize = require("sequelize");

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
    await Holiday.create(req.body);
    res.status(200).json({
      success: true,
      message: "Holiday created successfully",
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
  console.log("offset", offset)
	const holidays = await Holiday.findAll({ limit, offset });
	const totalBoxes = await Holiday.count();
	res.status(200).json({
		success: true,
    holidays,
    count: totalBoxes,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalBoxes / limit),
	})
}

getBoxDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findOne({ where: { id } });
    if (!holiday) {
      res.status(404).json({
        success: false,
        message: "Meal box not found",
      });
    }
    res.status(200).json({
      success: true,
      data: holiday,
    });
  } catch (e) {
    next(e);
  }
};

updateBoxDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body)
    const { email, password, firstName, lastName, phoneNumber, role, status } =
      req.body;
    const holiday = await Holiday.findOne({ where: { id } });
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Meal box not found",
      });
    }
    console.log(" user ", holiday);
    await Holiday.update(req.body, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Meal box updated successfully",
    });
  }
  catch (e) {
    next(e);
  }
}

module.exports = {
  create,
	list,
  getBoxDetails,
  updateBoxDetails
}
