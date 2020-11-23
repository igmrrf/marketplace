const router = require("express").Router();
const Meal = require("../../models/meal");
const mealValidation = require("../../validations/meal");
const validate = require("../../validations");
const { requireLogin, verifyAdmin } = require("../../middlewares/checkAuth");

router.get("/", async (req, res) => {
  const meals = await Meal.find();
  return res.status(200).send(meals);
});

router.post(
  "/",
  [requireLogin, verifyAdmin, mealValidation, validate],
  async (req, res, next) => {
    try {
      const meal = new Meal({
        ...req.body,
      });

      const saved = await meal.save();
      return res.status(200).send({
        message: "Meal Successfully Created",
        data: saved,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
);

router.put("/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const meal = await Meal.findByIdAndUpdate(id, ...req.body);
    if (!meal) {
      return res.status(404).send({
        message: "Meal not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "Meal successfully updated",
        data: meal,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.delete("/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const meal = await Meal.findByIdAndRemove(id);
    if (!meal) {
      return res.status(404).send({
        message: "Meal not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "Meal successfully deleted",
        data: meal,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

module.exports = router;
