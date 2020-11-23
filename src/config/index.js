require("dotenv").config();
module.exports = {
	PORT: process.env.PORT,
	SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
	JWT_SECRET: process.env.JWT_SECRET,
	NODE_ENV: process.env.NODE_ENV || 'development',
	development: {
		MONGODBURI: process.env.MONGOURI,
	},
	production: {
		MONGODBURI: process.env.MONGOURI,
	},
	test: {
		MONGODBURI: process.env.TEST_MONGO_DBURI,
	},
};
