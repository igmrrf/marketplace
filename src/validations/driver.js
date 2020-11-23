const { body, validationResult, check } = require('express-validator');
const { Driver } = require('../models/');

const driverSignUpRules = () => {
	return [
        check('image').optional(),
        body('first_name').trim().isString().not().isEmpty(),
        body('last_name').trim().isString().not().isEmpty(),
        body('email')
            .notEmpty()
			.withMessage('Email is required')
			.matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
			.withMessage('Enter a valid email')
            .custom((value, {}) => {
                return Driver.findOne({ email: value }).then(
                    (driverDoc) => {
                        if (driverDoc) {
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
        body('nextOfKinName', 'Name of Next of Kin is required')
            .trim().isString().not().isEmpty(),
        body('nextOfKinRel', 'Relationship of Next of Kin is required')
            .trim().isString().not().isEmpty(),
        body('nextOfKinPhoneNumber')
            .isMobilePhone("en-NG")
            .withMessage('Please enter a valid phone number for Next of Kin')
            .isLength({min: 10, max: 13}),
        body('city').notEmpty(),
        body('street').notEmpty(),
        body('houseNumber').notEmpty(),
        body('vehicle_number')
            .notEmpty()
			.withMessage('Vehicle Number is required')
            .custom(async (value, {}) => {
                const driverDoc = await Driver.findOne({ vehicle_number: value });
                if (driverDoc) {
                    return Promise.reject('Vehicle number already exists');
                }
                return true;
            })
	];
};

const driverSignInRules = () => {
    return [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body('password', 'Your email or password is not valid')
            .trim()
            .isLength({ min: 8 })
            .isAlphanumeric(),
    ]
};

const viewAllDriversRules = () => {
    return [
        check("filter")
            .optional()
            .isIn(["verified", "checked", "not-checked", "not-verified"])
            .withMessage(
                "You can filter drivers either by verified  or not-verified, checked application or not-checked"
            ),
    ]
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
    driverSignUpRules,
    viewAllDriversRules,
    driverSignInRules,
};
