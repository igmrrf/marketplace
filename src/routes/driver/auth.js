const express = require('express');

const { driverSignUpRules, driverSignInRules, validateError } = require('../../validations/driver');
const AuthController = require('../../controllers/driver/auth');

const router = express.Router();

router.post('/register', driverSignUpRules(), validateError, AuthController.signup);

router.post('/login', driverSignInRules(), validateError, AuthController.login);

// other endpoints for admin would require the requireLogin and driverOnly middleware for authorization

module.exports = router;
