const mongoose = require("mongoose");

const { Schema } = mongoose;

const driverSchema = new Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
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
        address: {
            city: String,
            street: String,
            houseNumber: String,
        },
        next_of_kin: {
            name: {
                type: String,
                required: true,
            },
            relationship: {
                type: String,
                required: true,
            },
            phone_number: String,
        },
        vehicle_number: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        application_status: {
            type: String,
            enum: ['checked', 'not-checked'],
            default: 'not-checked',
        },
        verified: {
			type: Boolean,
			default: false,
		},
        role: {
            type: String,
            default: 'DRIVER',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Driver', driverSchema);
