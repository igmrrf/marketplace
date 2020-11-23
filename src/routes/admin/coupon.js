const router = require("express").Router();
const Coupon = require("../../models/coupon");
const { couponValidation } = require("../../validations/coupon");
const validate = require("../../validations");
const { requireLogin, verifyAdmin } = require("../../middlewares/checkAuth");

router.get("/", [requireLogin, verifyAdmin], async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    return res.status(200).send(coupons);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [requireLogin, verifyAdmin, couponValidation, validate],
  async (req, res, next) => {
    try {
      const coupon = new Coupon({
        ...req.body,
      });
      const saved = await coupon.save();
      return res.status(201).send({
        message: "Coupon Successfully Created",
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
    const coupon = await Coupon.findByIdAndUpdate(id, { ...req.body });
    if (!coupon) {
      return res.status(404).send({
        message: "coupon not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "coupon successfully updated",
        data: coupon,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", [requireLogin, verifyAdmin], async (req, res, next) => {
  const id = req.params.id;
  try {
    const coupon = await Coupon.findByIdAndRemove(id);
    if (!coupon) {
      return res.status(404).send({
        message: "coupon not found",
        data: null,
      });
    } else {
      return res.status(200).send({
        message: "coupon successfully deleted",
        data: coupon,
      });
    }
  } catch (error) {
    next(error);
  }
});
