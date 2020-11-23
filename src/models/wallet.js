const mongoose = require("mongoose"),
	{ Schema } = mongoose;

const walletSchema = new Schema({
	userId: {
		type: String,
		required: true,
    },
	amount: {
        type: Number,
        default: 0,
	},
	pin: String,
  	pinExpire: Date,
});

module.exports = mongoose.model("Wallet", walletSchema);
