const mongoose = require("mongoose");

//Schema to store post data in the database
const managerSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String },
  dob: { type: String },
  company: { type: String },
});
managerSchema.set("timestamps", true);

//Creating a post model
const Manager = mongoose.model("manager", managerSchema);
module.exports = Manager;
