const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/userModel');
const userControllers = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../controllers/userController');
/*
// Client Routes
router.route('/client/register')
   .get(userControllers.renderClientRegister)
   .post(userControllers.createClient)
// Contractor Routes
router.route('/contractor/register')
  .get(userControllers.renderContractorRegister)
  .post(userControllers.createContractor)
*/

router.route('/register')
    .get(userControllers.renderRegister)
    .post(userControllers.registerUser);

router.route('/login')
   .get(userControllers.renderLogin)
   .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }), userControllers.loginUser)
   
router.route('/logout')
    .get(userControllers.logout)

router.route('/')
    .get(userControllers.getAllUsers)

router.route('/:id')
    .get(userControllers.getUser)
    .put(userControllers.updateUser)
    .put(userControllers.unblockUser)
    .delete(userControllers.deleteUser)

router.route('/updatedpassword/:id')
    .put(userControllers.updatePassword)

router.route('/forgetpassword')
    .post(userControllers.forgetPassword)
  
router.route('/resetpassword/:token')
    .put(userControllers.resetPasswordToken)
    
module.exports = router;