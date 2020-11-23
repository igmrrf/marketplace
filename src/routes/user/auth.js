const express = require("express");

const { requireLogin } = require("../../middlewares/checkAuth");
const AuthController = require("../../controllers/user/auth");
const {
  signUpValidationRules,
  signInValidationRules,
  userEmailRules,
  resetPasswordValRules,
  changePasswordRules,
} = require("../../validations/auth");
const validateError = require("../../validations");

const router = express.Router();

router.post(
  "/register",
  signUpValidationRules(),
  validateError,
  AuthController.signup
);

router.patch("/verify", AuthController.verifyUser);

router.post(
  "/login",
  signInValidationRules(),
  validateError,
  AuthController.login
);

router.post(
  "/forgot-password",
  userEmailRules(),
  validateError,
  AuthController.userForgotPassword
);

router.patch(
  "/reset-password",
  resetPasswordValRules(),
  validateError,
  AuthController.userResetPassword
);

router.post(
  "/resend-verification",
  userEmailRules(),
  validateError,
  AuthController.userRequestVerifyLink
);

router.post(
  "/update-password",
  requireLogin,
  changePasswordRules(),
  validateError,
  AuthController.updatePassword
);

router.patch("/user/update", requireLogin, AuthController.updateUser);

module.exports = router;
