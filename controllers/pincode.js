const Pincode = require("../models/pincode");
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
    await Pincode.create(req.body);
    res.status(200).json({
      success: true,
      message: "Pincode created successfully",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

list = async (req, res, next) => {

	const { page, size, code } = req.query;
  console.log(" page ", page, size);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset)
  const  whereCondition = {
    isDeleted: false
  }
  if(code) {
    whereCondition.code = { 
      [Sequelize.Op.like]: `%${code}%`
    }
  }
	const pincodes = await Pincode.findAll({ where: whereCondition, limit, offset, order: [["code", "ASC"]] });
	const totalPincodes = await Pincode.count({ where: whereCondition });
	res.status(200).json({
		success: true,
    pincodes,
    count: totalPincodes,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalPincodes / limit),
	})
}

getBoxDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pincode = await Pincode.findOne({ where: { id } });
    if (!pincode) {
      res.status(404).json({
        success: false,
        message: "Pincode not found",
      });
    }
    res.status(200).json({
      success: true,
      data: pincode,
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
    const pincode = await Pincode.findOne({ where: { id } });
    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found",
      });
    }
    console.log(" user ", pincode);
    await Pincode.update(req.body, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Pincode updated successfully",
    });
  }
  catch (e) {
    next(e);
  }
}

checkAvailability = async (req, res, next) => {	
		try {
		const { pincode } = req.query;
		const pinCodeFound = await Pincode.findOne({ where: { code: pincode, isDeleted: false } });
		if (!pinCodeFound) {
			res.status(404).json({
				success: false,
				message: "Pincode not found",
			});
		}
		res.status(200).json({
			success: true,
			message: "Pincode found",
		});
	}
	catch(e)	{
		next(e);
	}			
}

deletePincode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pincode = await Pincode.findOne({ where: { id } });
    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found",
      });
    }
    await Pincode.update({ isDeleted: true }, { where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Pincode deleted successfully",
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
  updateBoxDetails,
	checkAvailability,
  deletePincode,
}
