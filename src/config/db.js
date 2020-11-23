const mongoose = require("mongoose"),
    config = require('./index'),
    DB_URI = config[config.NODE_ENV].MONGODBURI;

const dbConnect = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Database connected successfully.');
    } catch (err) {
        console.log(`Mongoose connection was not succesful due to: ${err}`);
    }
};

module.exports = dbConnect;
