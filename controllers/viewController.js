const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // GET TOUR DATA FROM COLLECTION
  const tours = await Tour.find();
  // BUILD TEMPLATE
  // RENDER TEMPLATE USING DATA
  res
    .status(200)
    .render('overview', { title: 'All Tours', path: 'tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const id = res.locals.user ? res.locals.user.id : '';

  const tour = await Tour.findOne({ slug }).populate({ path: 'reviews' });

  const bookings = await Booking.find({ tour: tour._id });

  let booked;

  if (id) {
    booked = bookings.find(el => el.user.id.toString() === id.toString());
  }

  if (!tour) {
    return next(new AppError('There is no Tour found with that name', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
    totalBookings: bookings.length,
    status: tour.startDates[0] > Date.now(),
    booked,
  });
});

exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login to your account',
    path: 'login',
  });
});

exports.signup = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
    path: 'signup',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('accounts', {
    title: ' My account',
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('accounts', {
    title: 'My account',
    user,
  });
});

exports.verifyMyAcc = (req, res) => {
  res.status(200).render('hi');
};
