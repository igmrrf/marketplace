const { body, validationResult, check } = require('express-validator');
const { Organisation, User } = require('../models/');

const companySignUpRules = () => {
	return [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Company name is required')
            .custom((val, {}) => {
                return Organisation.findOne({ name: val }).then((result) => {
                    if (result) {
                        return Promise.reject("Company name is already in use");
                    }
                    return true;
                });
            }),
        body('address').trim().isString().not().isEmpty(),
        body('about').trim().isString().not().isEmpty(),
        body('website').isURL().withMessage("Invalid website url"),
        body('email')
            .notEmpty()
			.withMessage('Email is required')
			.matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
			.withMessage('Enter a valid email')
            .custom((value, {}) => {
                return User.findOne({ email: value }).then(
                    (doc) => {
                        if (doc) {
                            return Promise.reject('Email address already exists');
                        }
                    return true;
                });
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isAlphanumeric()
            .isLength({ min: 8 })
            .withMessage('Your password must contain a minimum of 8 characters'),
        body('phone_number')
            .isMobilePhone("en-NG")
            .withMessage('Please enter a valid phone number')
            .isLength({min: 10, max: 13}),
	];
};

const addCompanyUserRules = () => {
    return [
		body("email").notEmpty().isEmail().withMessage("Enter a valid email"),
	];
}

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
    companySignUpRules,
    addCompanyUserRules,
};
