//Module import

const jwt = require("jsonwebtoken");
const ManagerModel = require("../models/Manager");
const EmployeeModel = require("../models/Employee");

const Helper = require("../helpers/helpers");
const bcrypt = require("bcryptjs");
const ResponseFormatter = require("../helpers/responseFormatter");
const { genToken } = require("../middlewares/generate.js");
const helpers = require("../helpers/helpers");

//class that contains all the methods related to authentication
class AuthController {
  //Method for signing up a user
  async signUp(req, res) {
    try {
      let { firstName, lastName, email, password, address, dob, company } =
        req.body;
      email = email.toLowerCase();
      password = await bcrypt.hash(password, 8);

      const userExists = await Helper.checkUserExists(email);
      if (userExists) {
        return res.status(403).send({
          message: "Manager already exists",
          data: "",
          status: false,
        });
      }

      const addNewuser = await new ManagerModel({
        firstName,
        lastName,
        email,
        password,
        address,
        dob,
        company,
      }).save(function (err, user) {
        if (err) {
          console.log("err", err);
          return;
        }

        return res.status(201).send({
          message: "User created successfull.",
          data: user,
          status: true,
        });
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  //Method to add an employee to the database
  async addEmployee(req, res) {
    try {
      let { firstName, lastName, email, address, dob, mobile, city } = req.body;
      email = email.toLowerCase();

      const employeeExists = await EmployeeModel.findOne({ email });
      // console.log(employeeExists);

      if (employeeExists) {
        return res.status(403).send({
          message: "Employee already exists",
          data: "",
          status: false,
        });
      }

      const addNewEmployee = await new EmployeeModel({
        firstName,
        lastName,
        email,
        address,
        dob,
        mobile,
        city,
      }).save(async function (err, user) {
        if (err) {
          console.log("err", err);
          return;
        }
        const employees = await EmployeeModel.find();

        return res.status(201).send({
          message: "Employee added successfully.",
          data: employees,
          status: true,
        });
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  //Method to fetch all employees from the database
  async getAllEmployees(req, res) {
    try {
      const employees = await EmployeeModel.find();

      if (!employees) {
        return res.status(404).send({
          message: "No record found",
          data: "",
          status: false,
        });
      }

      return res.status(200).send({
        message: "Record found successfully.",
        data: employees,
        status: true,
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  //Method to fetch an employee from the database
  async getEmployee(req, res) {
    try {
      let { email } = req.body;
      const employee = await EmployeeModel.find({ email });

      if (!employee) {
        return res.status(404).send({
          message: "No record found",
          data: "",
          status: false,
        });
      }

      return res.status(200).send({
        message: "Record found successfully.",
        data: employee,
        status: true,
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  //Method to update an employee details in the database
  async updateEmployee(req, res) {
    try {
      let { email } = req.body;

      const employeeExists = await EmployeeModel.find({ email });
      if (!employeeExists) {
        return res.status(403).send({
          message: "No record found!",
          data: "",
          status: false,
        });
      }

      const UpdatedEmployee = await EmployeeModel.updateOne(
        { email },
        req.body
      );
      const employee = await EmployeeModel.find();

      return res.status(201).send({
        message: "Employee Updated successfully.",
        data: employee,
        status: true,
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  ////Method to delete a  employee from the database
  async deleteEmployee(req, res) {
    try {
      let { email } = req.body;
      // console.log(email);

      const employeeExists = await EmployeeModel.find({ email });
      if (!employeeExists) {
        return res.status(403).send({
          message: "No record found",
          data: "",
          status: false,
        });
      }

      const deleteEmployee = await EmployeeModel.deleteOne({ email });

      const employees = await EmployeeModel.find();

      return res.status(201).send({
        message: "Employee Deleted successfully.",
        data: employees,
        status: true,
      });
    } catch (error) {
      return res.status(400).send({
        message: "Something went worng!",
        data: error,
        status: false,
      });
    }
  }

  //Method to login a manager
  async login(req, res) {
    let { email, password } = req.body;
    const status = await Helper.matchCredentials(email.toLowerCase(), password);
    // console.log("status", status);

    if (!status.matched) {
      return res.status(401).send({
        message: status.message,
        data: "",
        status: false,
      });
    }

    delete status.userInfo._doc.password;
    let user = status.userInfo;

    const token = await genToken(user);
    user._doc.token = token;

    return res.status(200).send({
      message: "Login Successful.",
      data: { ...user._doc, isAuthLogin: true, timestamp: Date.now() },
      status: true,
    });
  }

  //Method for validating a user
  async matchToken(req, res) {
    const token = req.header("Authorization");
    // console.log("match token", token, process.env.PRIVATE_KEY);
    try {
      let { user } = jwt.verify(token, process.env.PRIVATE_KEY);
      // console.log("match token user", user);
      if (user) {
        const data = await Helper.checkUserExists(user.email);
        delete data._doc.password;

        if (!data) {
          return responseFormatter.error(
            res,
            {
              isExpire: true,
              status: false,
            },
            "SESSION EXPIRED! PLEASE LOGIN AGAIN."
          );
        } else {
          return ResponseFormatter.success(
            res,
            {
              data,
              token,
              isAuthLogin: true,
            },
            "Validated Succesfully"
          );
        }
      }
    } catch (err) {
      console.log("match token catch", err);

      return ResponseFormatter.error(
        res,
        {
          isExpire: true,
          status: false,
        },
        "SESSION EXPIRED. PLEASE LOGIN AGAIN."
      );
    }
  }
}

//exporting a module
module.exports = new AuthController();
