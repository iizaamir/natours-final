const express = require('express');
const userController = require('./../controllers/userController'); //To import all the user functions.
const authController = require('./../controllers/authController'); //Require the authentication controller.
const router = express.Router();
//Add a user resource.
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);  //Forgot password only receive the email address
router.patch ('/resetPassword/:token', authController.resetPassword);  //receive token and new passwod.
//Protect all routes after this middleware. 
router.use(authController.protect); //this middleware runs before all other middlewares after this

router.patch('/updateMyPassword', authController.updateMyPassword);
router.get('/me',userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin')); //after that all the routes are restricted by admin

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router;