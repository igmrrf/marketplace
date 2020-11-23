const express = require("express");


const AuthRoute = require('./auth');
const UserRoute = require('./user');
const DriverRoute = require('./driver');
const MealRoute = require('./meals');
const MenuRoute = require('./menu');


const router = express.Router();


router.use('/drivers', DriverRoute);  
router.use("/auth", AuthRoute);
router.use("/menu", MenuRoute);
router.use('/users', UserRoute);  
router.use("/meals", MealRoute);

module.exports = router;
