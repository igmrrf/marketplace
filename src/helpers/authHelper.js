const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/');

const hashPassword = (password) => {
	const salt = bcrypt.genSaltSync();
	return bcrypt.hashSync(password, salt);
};

const comparePassword = (password, hashedPassword) => {
	return bcrypt.compareSync(password, hashedPassword);
};

const generateToken = (payload, expIn) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: expIn });
};

const verifyToken = (token) => {
	return jwt.verify(token, JWT_SECRET);
};

module.exports = {
	hashPassword,
	comparePassword,
    generateToken,
    verifyToken,
};
