const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.use(authController.protect);

router.route('/me').get(userController.getMe, userController.getUser);

router
  .route('/updateMe')
  .patch(
    userController.uploadPhoto,
    userController.resizePhoto,
    userController.updateMe
  );

router.route('/deleteME').delete(userController.deleteMe);

router.patch('/updateMyPassword', authController.updatePassword);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAlluser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
