const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckOutSession = async (req, res) => {
  // 1) Get the currently boooked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create CheckOut Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/get-bookings`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.description,
        images: [`${req.protocol}://${req.get('host')}/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) Create Session  as response
  res.status(200).json({
    status: 'success',
    session,
  });
};

// exports.createTourBooking = async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// };

const createTourBooking = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

exports.getMyBookings = async (req, res, next) => {
  const bookings = await Booking.find();

  const tourId = bookings.map(el => el.tour);

  const tours = await Tour.find({ _id: { $in: tourId } });

  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  });
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_KEY
    );
  } catch (error) {
    res.status(400).send(`Webhook error:${error.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createTourBooking(event.data.object);

  res.status(200).json({ recieved: true });
};

exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
