const { body } = require("express-validator");
const menuValidation = () => {
  return [
    body("category")
      .trim()
      .isString()
      .not()
      .isEmpty()
      .withMessage("Menu Category is required"),
    body("mealId").not().isEmpty().withMessage("Meal Id is required"),
  ];
};

module.exports = menuValidation;
