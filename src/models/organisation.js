const mongoose = require("mongoose"),
	{ Schema } = mongoose;

const orgSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
	},
	address: {
		type: String,
		required: true,
	},
	about: {
		type: String,
		required: true,
	},
	website: {
		type: String,
		required: true,
	},
	users: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

module.exports = mongoose.model("Organisation", orgSchema);
