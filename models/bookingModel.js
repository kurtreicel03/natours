const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A booking must belong to a tour'],
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A booking must belong to a user'],
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookSchema);

module.exports = Booking;
