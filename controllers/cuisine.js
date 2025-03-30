const Cuisine = require("../models/cuisine");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// to get pagination information
getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

create = async (req, res, next) => {
  try {
    await Cuisine.create(req.body);
    res.status(200).json({
      success: true,
      message: "Cuisine created successfully",
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
	const cuisines = await Cuisine.findAll({ limit, offset });
	const totalCuisine = await Cuisine.count();
	res.status(200).json({
		success: true,
    cuisines,
    count: totalCuisine,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalCuisine / limit),
	})
}

getCuisineDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cuisine = await Cuisine.findOne({ where: { id } });
    if (!cuisine) {
      res.status(404).json({
        success: false,
        message: "Cuisine not found",
      });
    }
    res.status(200).json({
      success: true,
      data: cuisine,
    });
  } catch (e) {
    next(e);
  }
};

updateCuisineDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body)
    const cuisine = await Cuisine.findOne({ where: { id } });
    if (!cuisine) {
      return res.status(404).json({
        success: false,
        message: "cuisine not found",
      });
    }
    console.log(" cuisine ", cuisine);
    await Cuisine.update(req.body, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Cuisine updated successfully",
    });
  }
  catch (e) {
    next(e);
  }
}

module.exports = {
  create,
	list,
  getCuisineDetails,
  updateCuisineDetails
}
