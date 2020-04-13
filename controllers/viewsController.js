const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Route to get all the tours
exports.getOverview = catchAsync(async(req,res,next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find(); //retriving the tour data from the database.

    // 2) Build templete.
    // 3) Render that template using the tour data from step 1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours
    });
});

//Route for a specific tour detail 
exports.getTour = catchAsync(async(req,res,next) => {
    //1) Get ther data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug}).populate({  //also populate the arrays field
        path: 'reviews',
        fields: 'review rating user' //just want specific fields to populate.
    });
    //Error handling in case if there is no tour.
    if(!tour){
        return next(new AppError('There is no tour with that name.', 404));
    }
    //2) Build template

    //3) Render template using data from step 1)
    res.status(200).render('tour',{
        title: `${tour.name} Tour`,
        tour: tour
    });
});

exports.getLoginForm = (req,res) => {
    //Render the login template.
    res.status(200).render('login',{
        title: 'Log into your account'
    });
};

exports.getAccount = (req,res) => {
    //Don't need to query for the current user that is already done in protect middleware, just render the page 
    res.status(200).render('account', {
        title: 'Your account',
    });
};

//update user data when the request is coming from the form
exports.updateUserData = catchAsync(async(req,res,next) => {
    // add a middleware to parse the data coming from the form in app.js.
    // console.log('UPDATING USER', req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name : req.body.name,
        email: req.body.email
    },
    {
        new : true, //get the new updated document
        runValidators: true 
    }
    );
    //After submiting data then render the new updated results
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});

