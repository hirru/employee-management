//Module import

const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
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
      let { firstName, lastName, email, password } = req.body;
      email = email.toLowerCase();
      password = await bcrypt.hash(password, 8);

      const userExists = await Helper.checkUserExists(email);
      if (userExists) {
        return res.status(403).send({
          message: "User already exists",
          data: "",
          status: false,
        });
      }

      const addNewuser = await new UserModel({
        firstName,
        lastName,
        email,
        password,
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

  //Method to login a user
  async login(req, res) {
    let { email, password } = req.body;
    const status = await Helper.matchCredentials(email.toLowerCase(), password);

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
    console.log("match token", token, process.env.PRIVATE_KEY);
    try {
      let { user } = jwt.verify(token, process.env.PRIVATE_KEY);
      console.log("match token user", user);
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
