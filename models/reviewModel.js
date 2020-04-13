const mongoose = require('mongoose');
const Tour = require('./tourModel');
//Review // rating // createdAt // ref to tour the review belongs to // ref to user
const reviewSchema = new mongoose.Schema({
    review : {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    rating : {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    // This is parent referencing, review is child and it has Referencing tours and users.
    tour : { //What tour this review belong to.
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'Review must belong to a tour'] //each review knows what tour ot belongs to
    },
    user : { // user who wrote the review
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
{  
    toJSON: {virtuals : true},
    toObject: {virtuals : true}
}
);

//one user create one review for a specific tour.
reviewSchema.index({ tour:1, user:1 }, {unique: true});

//Query middleware to populate reviews with tour and user.
reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select: 'name' //select the specific field inside tours
    // }).populate({
    //     path: 'user',
    //     select: 'name photo' //just display user name and photo
    // });
    this.populate({
        path: 'user',
        select: 'name photo' //just display user name and photo
    });
    next();
});
//Static method for reviews, this fun is avalible on model
reviewSchema.statics.calcAverageRatings = async function(tourId){ //take tourId to which the current review belongs to 
    //To do calculation, use the aggregation pipeline.
    const stats = await this.aggregate([//this points to current model,pass an arrray of all stages we want to aggregate
        { //1st satge.
            $match: {tour: tourId}
        },
        {
            $group:{
                _id: '$tour', //commam field, that all documents have common that we want to group by. 
                nRating: {$sum: 1}, // add 1 by each tour that is matched in previous step 
                avgRating: {$avg: '$rating' },  //cal avg from all the rating field.
            }
        }
    ]); 
    console.log(stats); 
    if(stats.length > 0){ //Do below if we have something in the stats array.
         //Persist the calculated statistic into current tour document.
    await Tour.findByIdAndUpdate(tourId,{//Find the current tour and update it,pass id and the obj of data we 
        //want to update
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
    }else{ //go back to defaults when no reviews at all.
        await Tour.findByIdAndUpdate(tourId,{//Find the current tour and update it,pass id and the obj of data we 
            //want to update
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};
//call the function after a new review has created
reviewSchema.post('save', function(){ //after a doc is saved then calculate the ratings
    //This points to current review.
    this.constructor.calcAverageRatings(this.tour);//this points to the model, this is current document,
    //and constructor is model who created that document.
    // next();   
    //Review.calcAverageRatings(this.tour);  //This point the review variable is not defined, this code runs in a 
    //sequence it is declared
});
//To update and delete a review.
//findOneAndUpdate.
//findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){ //pre middleware has next keyword
    this.r = await this.findOne(); //to need to get access to document
    // console.log(r);
    next();
}); 
//After the above query is finished and the review has been updated,then call fun calcAverageRatings
reviewSchema.post(/^findOneAnd/, async function(){ 
    // this.r = await this.findOne(); doesnot work bcz the query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour); //to get tour id, pass data from pre middleware 
    //to post middleware & the call on model
}); 

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;