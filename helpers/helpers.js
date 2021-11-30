//Module Import
const bcrypt = require("bcryptjs");
const ManagerModel = require("../models/Manager");

class Helper {
  // Method to check if user exist or not
  async checkUserExists(email) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await ManagerModel.findOne({ email });
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Method to match the credentials of the user
  async matchCredentials(email, password) {
    const userExists = await this.checkUserExists(email);
    let status = {};
    if (!userExists) {
      status = {
        message: "User does not exist",
        matched: false,
        userInfo: null,
      };
    } else {
      if (await bcrypt.compare(password, userExists.password)) {
        delete userExists.params;
        status = {
          message: "Credentials matched",
          matched: true,
          userInfo: userExists,
        };
      } else {
        status = {
          message: "Credentials does not matched",
          matched: false,
          userInfo: null,
        };
      }
    }

    return status;
  }
}

module.exports = new Helper();
// export default new Helper();
