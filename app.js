const express = require('express');

const path = require('path');

const morgan = require('morgan');

const app = express();

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const compression = require('compression');

const cors = require('cors');

// GLOBAL MIDDLEWARE

app.enable('trust proxy');

// IMPLEMENT CORS
app.use(cors());
//Access-Control-Allow-Origin *
//
// app.use(
//   cors({
//     origin: `https://www.natours.com`,
//   })
// );

app.options('*', cors());

// SERVING STATIC FILES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));

// SET SECURITY HTTP HEADER
app.use(helmet());

// DEVELOPMENT LOGGIN
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// SET REQUEST LIMITER
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many request from this Ip please, try again later',
});

// LIMITER
app.use('/api', limiter);

// BODY PARSER
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// COOKIE PARSER
app.use(cookieParser());

// DATA SANITIZATION AGAINTS NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINTS XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'maxGroupSize',
    ],
  })
);

app.use(compression());

const errorController = require('./controllers/errorController');

const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const reviewRouter = require('./routes/reviewRoutes');

const viewRouter = require('./routes/viewRoutes');

const bookingRouter = require('./routes/bookingRoutes');

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
