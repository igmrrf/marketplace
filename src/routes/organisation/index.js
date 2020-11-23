const express = require('express');

const AuthRoute = require('./auth');
const UserRoute = require('./user');

const router = express.Router();


router.use('/auth', AuthRoute);

router.use('/users', UserRoute);

module.exports = router;
