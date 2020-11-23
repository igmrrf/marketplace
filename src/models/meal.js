const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mealSchema = new Schema({
  tag: {
    type: String,
    required: true
  },
  mealname: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  option_one: {
    type: String,
    required: true
  },
  option_two: {
    type: String
  },
  units_available: {
    type: Number,
    required: true
  },
  image_url_one: {
    type: String,
    required: true
  },
  image_url_two: {
    type: String
  },
  category: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', mealSchema);
