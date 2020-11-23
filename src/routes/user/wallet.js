const express = require('express');

const { requireLogin } = require('../../middlewares/checkAuth');
const WalletController = require('../../controllers/user/wallet');
const { 
  sendFromWalletRules,
  validateError,
} = require('../../validations/auth');

const router = express.Router();

// user taps a button to request a one time pin when they are ready to transfer from there wallet
router.get('/pin/get', requireLogin, WalletController.getVerificationCode);

router.post(
    '/send', 
    requireLogin, 
    sendFromWalletRules(), 
    validateError,
    WalletController.sendWalletMoney
)
module.exports = router;
