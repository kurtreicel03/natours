// const handleInvalidI

const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = err => {
  const { name } = err.keyValue;
  const message = `The tour "${name}" already been taken please use other name`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  const message = `Invalid input data, ${errors}`;

  return new AppError(message, 400);
};
const handleJwtTokenError = () =>
  new AppError('Invalid Token please login again', 401);

const handleJwtTokenExpired = () =>
  new AppError('Your Token expired please login again', 401);

const sendErrorDev = (err, req, res) => {
  // API ERROR
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errror: err,
      stack: err.stack,
    });
  }
  // RENDERED ERRROR
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API ERR
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    if (!err.isOperational) {
      return res.status(500).json({
        status: 'error',
        message: 'oops something went wrong',
        error: err,
      });
    }
  }

  //  RENDERD ERROR

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      message: err.message,
    });
  }

  return res.status(500).render('error', {
    title: 'Something Went Wrong!',
    message: 'oops something went wrong, Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJwtTokenError(error);
    if (err.name === 'TokenExpiredError') error = handleJwtTokenExpired(error);
    sendErrorProd(error, req, res);
  }
};
