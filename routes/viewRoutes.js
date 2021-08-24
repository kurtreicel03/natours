const express = require('express');

const router = express.Router();

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingsController');

router.use(viewController.alert);

router.get('/verify/:token', authController.verifyUser);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/signup', authController.isLoggedIn, viewController.signup);

router.post(
  '/submit-user-data',
  authController.isLoggedIn,
  authController.protect,
  viewController.updateAccount
);

router.get(
  '/get-bookings',
  authController.isLoggedIn,
  authController.protect,
  bookingController.getMyBookings
);

module.exports = router;
