const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookies Option
  const cookieOption = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  user.password = undefined;

  // //Sending Cookie
  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/verify/${newUser.id}`;

  await new Email(newUser, url).sendWelcome();

  res.status(201).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.params.userId,
    {
      verified: true,
    },
    { new: true, runValidators: true }
  );

  res.status(200).redirect('/login');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please Input Email or Password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid Email ', 401));
  }

  if (!user.verified) {
    return next(new AppError('Please verify your account', 401));
  }

  if (!(await user.correctPassword(user.password, password))) {
    return next(new AppError('Invalid Password', 401));
  }

  createSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1) Getting Token and Check if there is a Token
    if (req.cookies.jwt) {
      // 2) Verification Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exist

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      if (!currentUser.verified) {
        return next();
      }

      // 4) Check if user changed password  after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;

      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting Token and Check if there is a Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Authorization failed', 401));
  }
  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging  to this token does no longer exist',
        401
      )
    );
  }

  if (!currentUser.verified) {
    return next(new AppError('Your account is not verified', 401));
  }

  // 4) Check if user changed password  after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('The user recently change password please login again', 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on Posted email ;
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user email address', 404));
  }
  // 2) Genererate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3)  Send it to users email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based token
  const hashCrypto = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashCrypto,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) Check if token is invalid or expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for user

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Wrong password', 401));
  }

  // 3) If so, Update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, Send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user,
  //   },
  // });
});
