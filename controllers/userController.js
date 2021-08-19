const multer = require('multer');

const sharp = require('sharp');

const User = require('../models/userModel');

const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

const objFilter = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user._id}-${new Date(
//       Date.now()
//     ).toISOString()}.${ext}`;
//     cb(null, fileName);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Error type of file ,Please only upload image file!', 403),
      false
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const photo = req.file;

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update, please use /forgotMyPassword',
        400
      )
    );
  }

  const filteredObj = objFilter(req.body, 'name', 'email');

  if (photo) {
    filteredObj.photo = photo.filename;
  }

  // update user
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getUser = factory.getOne(User);

exports.getAlluser = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
