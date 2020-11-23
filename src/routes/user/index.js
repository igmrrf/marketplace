const express = require('express');

const AuthRoute = require('./auth');
const WalletRoute = require('./wallet');
// const MealRoute = require('./meals');

const router = express.Router();


router.use('/auth', AuthRoute);
router.use('/wallet', WalletRoute);
// router.use('/shop', ShopRoute);

// router.use('/meals', MealRoute);


module.exports = router;
