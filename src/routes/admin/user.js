const express = require('express');

const AuthController = require('../../controllers/admin/user');
const { requireLogin, verifyAdmin } = require('../../middlewares/checkAuth');

const router = express.Router();

router.get(
    '/:userId', 
    [requireLogin,
    verifyAdmin], 
    AuthController.getUser
);

router.delete(
    '/:userId', 
    [requireLogin,
    verifyAdmin], 
    AuthController.deleteUser
);

router.patch(
    '/:userId', 
    [requireLogin,
    verifyAdmin], 
    AuthController.editUserInfo
);

router.get(
    '/search', 
    [requireLogin,
    verifyAdmin], 
    AuthController.searchUsers
);

module.exports = router;
