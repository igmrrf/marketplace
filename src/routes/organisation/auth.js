const express = require('express');

const { requireLogin } = require('../../middlewares/checkAuth');
const AuthController = require('../../controllers/organisation/auth');
const { 
  companySignUpRules,
  validateError,
} = require('../../validations/company');

const router = express.Router();

router.post('/register', companySignUpRules(), validateError, AuthController.signup);

router.patch('/verify', AuthController.verifyCompany);

// company can sign in like a regular user
module.exports = router;
