const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
        },
        organisation: {
			type: Schema.Types.ObjectId,
			ref: "Organisation",
		},
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        referer: {
            type: String,
        },
        verified: {
			type: Boolean,
			default: false,
        },
        wallet: {
            type: Schema.Types.ObjectId,
			ref: "Wallet",
        },
        basket: [
            {
                meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
                mealCount: Number,
            },
        ],
        role: {
            type: String,
            enum: ['USER', 'ADMIN', 'COMPANY'],
            default: 'USER',
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('User', userSchema);
