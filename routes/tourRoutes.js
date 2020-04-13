const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController'); //To import all the tour functions.
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');


//WE can also did above with destructuring like below and then do it directly without tourController.
//const {getAllTours,createTour,getTour,updateTour,deleteTour} = require('./../controllers/tourController');
const router = express.Router();//we create a new router,to connect this new router to application using middlewar.

// POST tour/1234dfg/reviews
// GET tour/dhhfh455/reviews
// GET tours/234fgh/reviews/23456
// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'),
// reviewController.createReview);  
router.use('/:tourId/reviews',reviewRouter);    

// app.get('/api/v1/tours' , getAllTours);
// app.post('/api/v1/tours' , createTour);
//router.param('id', tourController.checkID ); 
//Task : Create a checkBody middleware function,
            //check if body contains the name and price property.
            //If not send back status 400 (bad request)
            //Add it to the post handler stack. 
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours); //Before calling this 
//route, prefill some fields in query string, so to do this run a middle before to run getAllTours
router.route('/tour-stats').get(tourController.getTourStats); //route for aggregation statistic

router.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan); 

router.route('/').get(tourController.getAllTours)
.post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);//same as above two, 
// .post(tourController.createTour);
//add function before the createTour.
// app.get('/api/v1/tours/:id' , getTour);
// app.patch('/api/v1/tours/:id' , updateTour);
// app.delete('/api/v1/tours/:id' , deleteTour); 

//coordinated of place where we lived.
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin); 
// tours-within?distance=233&center=-40,45&unit=mi  //also do this with query parameters.
// tours-within/233/center/-40,45/unit/mi   //but we do like this.

//calculate distance to all tours in our collection from a certain point.
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/:id').get(tourController.getTour)
.patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.updateTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);
//same as above three.

module.exports = router; 