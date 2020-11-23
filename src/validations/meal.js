const { body } = require("express-validator");
const mealValidation = () => {
  return [
    body("meal_name")
      .trim()
      .isString()
      .not()
      .isEmpty()
      .withMessage("Meal Name is required"),
    body("description")
      .trim()
      .isString()
      .not()
      .isEmpty()
      .withMessage("Description is required"),
    body("price").notEmpty().withMessage("Price is required"),
    body("option1").trim().isNumeric(),
    body("option2").trim().isString(),
    body("image1_url").isString(),
    body("image2_url").isString(),
  ];
};

module.exports = mealValidation;
