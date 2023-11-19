const express = require('express');
const router = express.Router();
const homeControllers = require('../controllers/homeController')
const { isAuthenticated, isAdmin } = require('../controllers/authController');

router.route('/')
   .get(homeControllers.renderHome)
router.route('/services')
   .get(homeControllers.services)
   router.route('/about-us')
   .get(homeControllers.about)
router.route('/contact-us')
   .get(homeControllers.contact)
router.route('/coming-soon')
   .get(homeControllers.comingSoon)


module.exports = router;