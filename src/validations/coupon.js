const { body } = require("express-validator");
const couponValidation = () => {
  return [
    body("code")
      .trim()
      .isString()
      .not()
      .isEmpty()
      .withMessage("Code is required"),
    body("type")
      .trim()
      .isString()
      .not()
      .isEmpty()
      .withMessage("Type is required"),
    body("discount").notEmpty().withMessage("Discount is required"),
    body("value").trim().isNumeric(),
    body("category")
      .trim()
      .isString()
      .not.isEmpty()
      .withMessage("Category is required for coupon"),
    body("number")
      .isNumeric()
      .not()
      .isEmpty()
      .withMessage("Number of possible coupon use is required"),
    body("available").isBoolean(),
    body("start_date")
      .isDate()
      .not()
      .isEmpty()
      .withMessage("End Date is required"),
    body("end_date")
      .isDate()
      .not()
      .isEmpty()
      .withMessage("End Date is required"),
    body("owner")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Owner of coupon must be Initialized"),
  ];
};

export default couponValidation;
