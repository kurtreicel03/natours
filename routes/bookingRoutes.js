const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckOutSession
);

router
  .route('/')
  .get(authController.protect, bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
