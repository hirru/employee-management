//Module imports
const express = require("express");
const HandleErrors = require("../middlewares/error");
const router = express.Router();
const authController = require("../controllers/Auth");

//Auth api routes
router.post("/signUp", HandleErrors(authController.signUp));
router.post("/login", HandleErrors(authController.login));
router.post("/addEmployee", HandleErrors(authController.addEmployee));
router.get("/getAllEmployees", HandleErrors(authController.getAllEmployees));
router.get("/getEmployee", HandleErrors(authController.getEmployee));

router.post("/updateEmployee", HandleErrors(authController.updateEmployee));
router.post("/deleteEmployee", HandleErrors(authController.deleteEmployee));

router.post("/matchToken", HandleErrors(authController.matchToken));

//module export
module.exports = router;
