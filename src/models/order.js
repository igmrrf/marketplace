const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    menu_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    meal_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    price: {
      type: Number,
      required: false,
    },
    delivery_location: {
      type: String,
    },
    delivery_time: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
