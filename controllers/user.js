const User = require("../models/user");
const Employee = require("../models/employee");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcryptjs");
const { generateJwtToken } = require("../utils/authorization");

register = async (req, res, next) => {
  try {
    console.log(" my body ", req.body);
    await User.create(req.body);

    res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (e) {
    next(e);
  }
};

//GET /search?&page=1&size=5
//GET /search?&page=1&size=5&sortBy=first_name:DESC
//GET /search?first_name=text&sortBy=first_name:DESC
//GET /search?first_name=text&page=0&size=10&sortBy=first_name:DESC
//GET /search?first_name=text&last_name=text&page=0&size=10&sortBy=first_name:DESC
search = async (req, res, next) => {
  try {
    const { page, size, first_name, last_name, empId } = req.query;
    const findOptions = [];
    const order = [];

    const { limit, offset } = getPagination(page, size);

    if (first_name) findOptions.push({ first_name: { [Op.like]: first_name } });
    if (last_name) findOptions.push({ last_name: { [Op.like]: last_name } });
    if (empId) findOptions.push({ empId: { [Op.like]: empId } });

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      order.push(parts);
    } else order.push(["first_name", "ASC"]);

    const results = await Employee.findAndCountAll({
      limit,
      offset,
      where: {
        [Op.and]: findOptions,
      },
      order,
    });
    const employees = getPagingData(results, page, limit);

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (e) {
    next(e);
  }
};

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

login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check whether email id exists or not
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(403).json({
        success: false,
        message: "Oops! Either Email or Password is incorrect.",
      });
    }

    // check whether the new hashed password matches with original hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(403).json({
        success: false,
        message: "Oops! Either Email or Password is incorrect.",
      });
    }

    // generate token
    const token = await generateJwtToken(user);

    res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (e) {
    next(e);
  }
};

create = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role, status } =
      req.body;
    // check if user exists by email
    const user = await User.findOne({ where: { email } });
    if (user) {
			return res.status(403).json({
					success: false,
					message: "User already exists",
				});
    }
    await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
      status,
    });
    res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (e) {
    console.log(" error ", e);
    next(e);
  }
};

list = async (req, res, next) => {
	const { page, size, search } = req.query;
  console.log(" page ", page, size);
  const { limit, offset } = getPagination(page, size);
  console.log(" limit ", limit);
  console.log("offset", offset)
  const whereCondition = {
    id: { [Op.ne]: req.user.id, },
    role: { [Op.ne]: "super_admin" },
  }
  if(search) {
    whereCondition[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { role: { [Op.like]: `%${search}%` } },
    ]
  }
	const users = await User.findAll({ where: whereCondition, limit, offset });
	const totalUsers = await User.count({ where: whereCondition });
	res.status(200).json({
		success: true,
    users,
    count: totalUsers,
    currentPage: page ? +page : 0,
    totalPages: Math.ceil(totalUsers / limit),
	})
}

getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

updateUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(" req body ", req.body)
    const { email, password, firstName, lastName, phoneNumber, role, status } =
      req.body;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log(" user ", user);
    await User.update(
      {
        email,
        password,
        firstName,
        lastName,
        role,
        status,
      },
      { where: { id: id } }
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  }
  catch (e) {
    next(e);
  }
}

adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // check whether email id exists or not
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(403).json({
        success: false,
        message: "Oops! Email Not found.",
      });
    }

    if(password !== user.password) {
      res.status(403).json({
        success: false,
        message: "Password is incorrect.",
      });
    }

    // generate token
    const token = await generateJwtToken(user);

    res.status(200).json({
      success: true,
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }); 
  } catch (e) {
    next(e);
  }
}

deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await User.destroy({ where: { id } });
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
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
  getUserDetails,
  updateUserDetails,
  adminLogin,
  deleteUser
}
