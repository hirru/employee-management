// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken");

const genToken = (user) => {
  const token = jwt.sign({ user }, process.env.PRIVATE_KEY, {
    expiresIn: "48hr",
  });
  return (user.token = token);
};

const genVerifyEmailToken = (email) => {
  const token = jwt.sign({ email: email }, key, {
    expiresIn: "24hr",
  });
  return token;
};

module.exports = { genToken, genVerifyEmailToken };
