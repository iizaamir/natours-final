const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({mergeParams: true});

// POST tour/1234dfg/reviews
// GET tour/2334dffgg/reviews 
// POST /reviews

router.use(authController.protect);//Noone can access below routes without being authenticated.

router.route('/').get(reviewController.getAllReviews).post(authController.restrictTo('user'),
reviewController.setTourUserIds,reviewController.createReview); 

router.route('/:id').get(reviewController.getReview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview);

module.exports = router;