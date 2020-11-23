const router = require("express").Router();
const Menu = require("../../models/menu");
const menuValidation = require("../../validations/menu");
const validate = require("../../validations");
const { requireLogin, verifyAdmin } = require("../../middlewares/checkAuth");

router.get("/", async (req, res, next) => {
  try {
    const menus = await Menu.find();
    return res.status(200).send(menus);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.post(
  "/",
  [requireLogin, verifyAdmin],
  async (req, res, next) => {
    try {
      const menu = new Menu({
        ...req.body,
      });

      const saved = await menu.save();
      return res.status(201).send({
        message: "Menu Successfully Created",
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
    const menu = await Menu.findByIdAndUpdate(id, { ...req.body });
    if (!menu) {
      return res.status(404).send({
        message: "Menu not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "Menu successfully updated",
        data: menu,
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
    const menu = await Menu.findByIdAndRemove(id);
    if (!menu) {
      return res.status(404).send({
        message: "Menu not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "Menu successfully deleted",
        data: menu,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

// Extra Routes that are need
//
// 1. Route to add a meal's id to the menu's meal id list
// 2. Route to get meals from the menu's meal id list
// 3. route to delete a meal id from the menu's meal id
const Meal = require("../../models/meal");

// 1
router.put("/put/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  const { meal_id } = req.body;
  try {
    const menu = await Menu.findByIdAndUpdate(id, {
      $addToSet: { mealId: [meal_id] },
    });
    if (!menu) {
      return res.status(404).send({
        message: "Meal was not added to Menu",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "Meal was successfully added to Menu",
        data: menu,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

//2
router.get("/get/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const menu = await Menu.findById(id);
    const menuIds = menu.mealId;
    const menu_list = [];

    menuIds.map((each) => {
      const meal = Meal.findById(each);
      menu_list.push(meal);
    });
    return res.status(200).send({
      message: "Meal was successfully added to Menu",
      data: menu_list,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.delete(
  "/delete/:id",
  [requireLogin, verifyAdmin],
  async (req, res, next) => {
    const id = req.params.id;
    const { meal_id } = req.body;
    try {
      const menu = await Menu.findById(id);
      menu.mealId = menu.mealId.find((meal) => meal !== meal_id);
      const saved = menu.save();

      return res.status(200).send({
        message: "Meal was successfully added to Menu",
        data: saved,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
);

module.exports = router;
