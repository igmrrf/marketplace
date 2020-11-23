const express = require('express');

const DriverController = require('../../controllers/admin/driver');
const { requireLogin, verifyAdmin } = require('../../middlewares/checkAuth');
const { 
  viewAllDriversRules,
  validateError,
} = require('../../validations/driver');

const router = express.Router();

router.get(
    '/', 
    [requireLogin,
    verifyAdmin], 
    viewAllDriversRules(), 
    validateError, 
    DriverController.viewAllDrivers
);

router.get(
    '/:driverId', 
    [requireLogin,
    verifyAdmin], 
    DriverController.getDriver
);

router.delete(
    '/:driverId', 
    [requireLogin,
    verifyAdmin], 
    DriverController.deleteDriver
);

router.put(
    '/:driverId', 
    [requireLogin,
    verifyAdmin], 
    DriverController.editDriverRecord
);

router.put(
    '/verify/:driverId',
    [requireLogin,
    verifyAdmin],
    DriverController.approveDriver
);

module.exports = router;
