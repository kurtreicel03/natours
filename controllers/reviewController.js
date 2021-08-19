const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setReviewId = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const booking = await Booking.find({
    tour: req.params.tourId,
    user: req.user._id,
  });

  if (booking.length === 0) {
    return next(
      new AppError('You need to book this tour to write a review', 401)
    );
  }

  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
