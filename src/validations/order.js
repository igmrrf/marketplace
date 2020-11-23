const { body } = require("express-validator");
const orderValidation = () => {
  return [
    body("use_id")
      .isString()
      .not()
      .isEmpty()
      .withMessage("User Id is required"),
    body("menu_id")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Menu Id is required"),
    body("price").notEmpty().withMessage("Price is required"),
    body("delivery_location").isString(),
    body("delivery_time").trim().isString(),
    body("status").isBoolean(),
  ];
};

export default orderValidation;
