//Module imports
const express = require("express");
const router = express.Router();
const Auth = require("./routes/Auth");

//Api Routes
router.use("/api/auth", Auth);

//exporting module
module.exports = router;
