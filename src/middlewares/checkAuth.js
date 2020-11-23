const { User} = require("../models/");
const authHelper = require('../helpers/authHelper');
const CustomError = require("../helpers/responses/CustomError");

const requireLogin = async (req, res, next) => {
    if (!req.get('Authorization')) {
        next(new CustomError(401, "Access Denied. Not Authenticated."));
        return;
    }
    let token = req.get('Authorization');

    if (token.startsWith("Bearer ")) {
        token = token.split(' ')[1];
    }

    try {
        const decodedToken = authHelper.verifyToken(token);
        const user = await User.findOne({ user_id: decodedToken.userId });
        if (!user) {
            next(new CustomError(401, "Access Denied. Not Authorized to access this route."));
            return;
        }
        req.user = user;
        return next();    
    } catch (error) {
        console.log("Error from user authentication >>>>> ", error);
        if (error.name === 'TokenExpiredError') {
            next(new CustomError(401, "Access Denied. Token expired."));
            return;
        }
        return next(error);
    }
};

const verifyAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role !== "ADMIN") {
        next(new CustomError(401, "Access Denied. Not Authorized to access admin-only routes."));
        return;
    }
    return next();
};

const checkDriver = (req, res, next) => {
    const { role } = req.user;
    if (role !== "DRIVER") {
        next(new CustomError(401, "Access Denied. Not Authorized to access driver-only routes."));
        return;
    }
    return next();
};

module.exports = {
    verifyAdmin,
    requireLogin,
    checkDriver,
};
