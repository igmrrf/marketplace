const express = require('express');

const AuthController = require('../../controllers/admin/auth');
const { requireLogin, verifyAdmin } = require('../../middlewares/checkAuth');
const { 
  signUpValidationRules,
  signInValidationRules,
  viewAllUsersRules,
  validateError,
} = require('../../validations/auth');

const router = express.Router();

router.post('/register', signUpValidationRules(), validateError,  AuthController.signup);

router.patch('/verify', AuthController.verifyAdmin);

router.post('/login', signInValidationRules(), validateError, AuthController.login);

router.get(
  '/users', 
  [requireLogin,
  verifyAdmin], 
  viewAllUsersRules(), 
  validateError, 
  AuthController.getAllUsers
);

module.exports = router;
