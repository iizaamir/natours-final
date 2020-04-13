const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const router = express.Router();

//we want this middleware in every single route
//router.use(authController.isLoggedIn); //next middleware passthrough this middleware.
// routes to access to pug templates

router.get('/', authController.isLoggedIn, viewsController.getOverview); //This is the root page.
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn , viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

//route to update the user data.
router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;

