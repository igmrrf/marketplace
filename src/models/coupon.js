const mongoose = require("mongoose");

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
    },
    value: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    start_date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    end_date: {
      type: Date,
      expires: 4289898989,
    },
    owner: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
