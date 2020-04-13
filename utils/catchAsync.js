//To Make one function for all catch blocks
// const catchAsync = fn => {
module.exports = (fn) => {
    return (req,res,next) => {//this is the fun that express calls when createTour handler hits, 
        //this return is assigned to createTour
        fn(req,res,next).catch(err => next(err));//catch means promise is rejected, catch handles the err in 
        // the next function and error ends up in the global error handling middleware
    };   
};