const router = require("express").Router();
const Order = require("../../models/order");
const { orderValidation } = require("../../validations/order");
const validate = require("../../validations");
const { requireLogin, verifyAdmin } = require("../../middlewares/checkAuth");

router.get("/", [requireLogin, verifyAdmin], async (req, res, next) => {
  try {
    const orders = await Order.find();
    return res.status(200).send(orders);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [requireLogin, verifyAdmin, orderValidation, validate],
  async (req, res, next) => {
    try {
      const order = new Order({
        ...req.body,
      });
      const saved = await order.save();
      return res.status(201).send({
        message: "order Successfully Created",
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const order = await Order.findByIdAndUpdate(id, { ...req.body });
    if (!order) {
      return res.status(404).send({
        message: "order not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "order successfully updated",
        data: order,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const order = await Order.findByIdAndRemove(id);
    if (!order) {
      return res.status(404).send({
        message: "order not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "order successfully deleted",
        data: order,
      });
    }
  } catch (error) {
    next(error);
  }
});
