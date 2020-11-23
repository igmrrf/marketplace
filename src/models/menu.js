const mongoose = require('mongoose');

const { Schema }= mongoose;

const menuSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  mealId: [{
    type: Schema.Types.ObjectId,
    ref: 'Meal'
  }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Menu', menuSchema);
