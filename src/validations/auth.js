const { body, validationResult, check } = require("express-validator");
const { User } = require("../models/");

const signUpValidationRules = () => {
  return [
    body("first_name").trim().isString().not().isEmpty(),
    body("last_name").trim().isString().not().isEmpty(),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      .withMessage("Enter a valid email")
      .custom((value, {}) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists");
          }
          return true;
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 8 })
      .withMessage("Your password must contain a minimum of 8 characters"),
    body("phone_number")
      .isMobilePhone("en-NG")
      .withMessage("Please enter a valid phone number")
      .isLength({ min: 10, max: 13 }),
  ];
};

const signInValidationRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(),
    body("password", "Your email or password is not valid")
      .trim()
      .isLength({ min: 8 })
      .isAlphanumeric(),
  ];
};

const viewAllUsersRules = () => {
  return [
    check("filter")
      .optional()
      .isIn(["verified", "not-verified"])
      .withMessage("You can filter users either by verified or not-verified"),
  ];
};

const userEmailRules = () => {
  return [
    body("email")
      .notEmpty()
      .isEmail()
      .withMessage("Please enter a valid email address"),
  ];
};

const resetPasswordValRules = () => {
  return [
    body("password", "Your password must contain a minimum of 8 characters")
      .trim()
      .isLength({ min: 8 })
      .isAlphanumeric(),
  ];
};

const changePasswordRules = () => {
    return [
        body('oldPassword')
			.if(body('newPassword').exists())
			.notEmpty()
			.custom((value, { req }) => value !== req.body.newPassword),
		body('newPassword')
			.notEmpty()
			.withMessage('A new password is required')
			.trim()
			.isLength({ min: 8 })
            .withMessage('Password must have at least 8 characters')
            .isAlphanumeric(),
		body("confirmPassword", "passwords do not match")
			.exists()
			.custom((val, { req }) => val === req.body.newPassword),
    ];
};

const sendFromWalletRules  = () => {
    return [
        body('pin').notEmpty().withMessage('Pin is required'),
        body('amount').trim().isInt().withMessage('Invalid amount entered'),
        body('userId').notEmpty().withMessage('User Id of the receipient required'),
    ];
};

const validateError = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	const extractedErrors = [];
	errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

	return res.status(422).json({
		errors: extractedErrors,
	});
};

module.exports = {
    validateError,
    signUpValidationRules,
    signInValidationRules,
    viewAllUsersRules,
    resetPasswordValRules,
    userEmailRules,
    changePasswordRules,
    sendFromWalletRules,
};
