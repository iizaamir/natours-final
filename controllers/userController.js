const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    //loop through obj and for each element check if it's allowed fields, if so added it to new obj.
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){ //if current field is one of allowed field
            newObj[el] = obj[el];
        }
    });
    return newObj;
}
// getMe to user retrive his own data, add this middleware before calling getUser
exports.getMe = (req,res,next) => {
    req.params.id = req.user.id; //protect fun add user to current request
    next();
};

//To update the currenty authenticated user data.
exports.updateMe = catchAsync(async (req,res,next) => {
    // 1) Create error if user POSTs password data.
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update. Please use /updateMyPassword.',400));
    }
    // 2) Filtered out unwanted fields names that are vnot allowed to be updated.
    const filteredBody = filterObj(req.body,'name','email'); //pass arguments that we want to keep in obj
    // 3) Update user data.
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data : {
            user: updatedUser
        }
    });
});
//Deleting the curent user.
exports.deleteMe = catchAsync(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false}); //active: false, data we wnat to update.
    res.status(204).json({ //204 delete and don't send on output res
    status : 'success',
    data: null
    });
});
//TO CREATE A USER
exports.createUser = (req,res) => {
    res.status(500).json({ //500 means internal server error.
        status : 'error',
        message : 'This route is not defined! Please use /signup instead'
    }) 
};
//TO GET ONE USER
exports.getUser = factory.getOne(User);
//TO GET THE ALL USERS
exports.getAllUsers = factory.getAll(User);
// catchAsync(async(req,res) => {
//     const users = await User.find();
//         // const tours = await query;
//         res.status(200).json({ //sending the json response.
//             status : 'success',
//             // requestedAt : req.requestTime,
//             results : users.length, //No of results we are sending in user array.
//             data : {
//                 users : users
//             }
//         });
// });
//TO UPDATE A USER, ONLY FOR ADMINISTRATOR, Do not update passwords with this
exports.updateUser = factory.updateOne(User);
// (req,res) => { 
//     res.status(500).json({ //500 means internal server error.
//         status : 'error',
//         message : 'This route is not yet defined'
//     }) 
// };
//TO DELETE A USER
exports.deleteUser = factory.deleteOne(User); 
//(req,res) => {
//     res.status(500).json({ //500 means internal server error.
//         status : 'error',
//         message : 'This route is not yet defined'
//     }) 
// };