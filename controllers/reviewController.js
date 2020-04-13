const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

//This code helps the createReview function
exports.setTourUserIds = (req,res,next) => {
    //Allow nested routes.
    if(!req.body.tours){ //if didn't specify tourid in body.
    req.body.tour = req.params.tourId;
   }
   if(!req.body.user){
       req.body.user = req.user.id; //get req.user from protect middleware.
   }
   next();
};
//To get all reviews.
exports.getAllReviews = factory.getAll(Review);
// catchAsync(async(req,res,next) => {
//     let filter;
//     if(req.params.tourId) filter = {tour : req.params.tourId};
//     const reviews = await Review.find(filter); //get reviews of a specific tour, if match with id else filter is empty obj 
//     res.status(200).json({
//         status: 'success',
//         result: reviews.length,
//         data: {
//             reviews : reviews
//         }
//     });
// }); 
//To get a review.
exports.getReview = factory.getOne(Review); 
//To create a review.
exports.createReview = factory.createOne(Review);
//To delete a review.
exports.deleteReview = factory.deleteOne(Review);
//To Update a review.
exports.updateReview = factory.updateOne(Review);