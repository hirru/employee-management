const mongoose = require("mongoose");

//Schema to store user data in the database
const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, unique: true },
  lastName: { type: String, required: true },
  address: { type: String },
  dob: { type: String },
  mobile: { type: Number },
  city: { type: String },
});

//Creating a employee model
const Employee = mongoose.model("employee", employeeSchema);
module.exports = Employee;
