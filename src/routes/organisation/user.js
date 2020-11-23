const express = require('express');

const { requireLogin } = require('../../middlewares/checkAuth');
const UserController = require('../../controllers/organisation/user');
const { 
  addCompanyUserRules,
  validateError,
} = require('../../validations/company');

const router = express.Router();

router.get('/', requireLogin, UserController.getAllCompanyUsers);

router.get('/:userId', requireLogin, UserController.getCompanyUser);

router.post(
  '/add', 
  requireLogin, 
  addCompanyUserRules(), 
  validateError, 
  UserController.addCompanyUser
);

router.delete('/remove/:userId', requireLogin, UserController.removeUserFromComp);

module.exports = router;
