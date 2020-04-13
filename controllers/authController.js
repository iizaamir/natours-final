const {promisify} = require('util'); //use to promisify the function so that a callback fun returns a promise,
//we destructure that obj and take promisify directly.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

//Function to create the token.
const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{ //just want id of the user to put in JWT,
    //for secret 2nd argu is string, 3rd argu is the expiration date/time of jwt
    expiresIn: process.env.JWT_EXPIRES_IN
    });
};
//Create and send token 
const createAndSendtoken = (user,statusCode,res) => { //user is where id is stored
    const token = signToken(user._id);  //creating a token
    const cookieOptions = { 
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), //convert to milisec.
            //secure : true, //Cookie sent only in encrypted connection using https, not work bcz of https,
            httpOnly : true // Cookie cannot be accessed/modified by browser
        };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions); //To send a cookie, res.cookie
    //Remove the password from output res
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user: user
        }
    });
} 
//TO CREATE A NEW USER.
exports.signup = catchAsync(async (req,res,next) => {
    //Security flaw in this so fix this.
    // const newUser = await User.create(req.body); //pass obj with data to create method, that data in req.body
    // //send that new user to client, also do like User.save()
    const newUser = await User.create({ //Allow data that we actually need to put into the newUser, no longer
        //register as admin, if need to add as administration go to mongodb compas and edit the role their(manually)
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
        // role: req.body.role,
        // passwordChangedAt: req.body.passwordChangedAt,
        // passwordResetToken: req.body.passwordResetToken,
        // passwordResetExpires: req.body.passwordResetExpires,
        // active: req.body.active
    });
    //Create the token
   createAndSendtoken(newUser,201,res);
    // newUser.password = undefined;
    // res.json({
    //     status: 'success',
    //     data: {
    //         user: newUser
    //     }
    // });
}); 

//TO CREATE A LOGIN
exports.login = catchAsync(async(req,res,next) => {
    const {email,password} = req.body;
    // 1) Check if email and password exists.
    if(!email || !password){
        //create a new error and the global error handling middleware looks it
        return next(new AppError('Please provide email and password!',400)); //return to finish the login function
    }
    // 2) Check if user exists and the password is correct
    const user = await User.findOne({email:email}).select('+password'); //find by email and password
    // console.log(user);
    //const correct = await user.correctPassword(password,user.password); //function we defined is an instance  
    //method so avalible on all user document, here user is user document
    if(!user || !(await user.correctPassword(password,user.password))){ //if user don't exist, the next don't execute
    //password is the password passed in body, and user.password is in db    
    return next(new AppError('Incorrect email or password',401));//401 means unauthoroized.
    };
    // 3) If everything is okay, send token to the client
    createAndSendtoken(user,200,res);
});

exports.logout = (req,res) => {
    res.cookie('jwt', 'loggedout', { //sending the cookie with no token
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 sec
        httpOnly: true
    });
    res.status(200).json({status:'success'});
};

//Middleware function to check if user is logged in or not.
exports.protect = catchAsync(async (req,res,next) => {
    // 1)Getting the token and check if it exist.
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt){ //If no token in the autherization header then look at the cookies
        token = req.cookies.jwt;
    }
    // console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access',401));//401 means unauthorized
    }
    // 2) Varification of token,that some one manipulate token or token expired, if so then handle these errors
    //in the global error handling middleware for production mode.
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET); //the resolved value of the promise is
    //the decoded payload from JWT
    // console.log(decoded);//decoded had id, iat and exp in an object.
    // 3) If varification is successful then check that user exists.
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {//return from this middleware and call the next one by error.
        return next(new AppError('The user belong to this token does no longer exist.',401));
    }
    // 4) Check if user changed password after the token was issued.
    //call the instance method on the user documenet, iat means issueAt time in milisec
    if(currentUser.changedPasswordAfter(decoded.iat)){ //if password change then errro.
        return next(new AppError('User recently changed password!Please logim again',401));
    }; 
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;//put entire user data on req, so we can use it next middleware function
    res.locals.user = currentUser; //use automatically on all the pug templates after it
    next();
});


//Middleware function only for render pages (not to protect any route)
exports.isLoggedIn = async (req,res,next) => {
    // 1)Getting the token and check if it exist.
    //token just come from cookies and not from authorization header
        if(req.cookies.jwt){    //If no token in the autherization header then look at the cookies
            try{
            // 2) Varification of token,that some one manipulate token or token expired, if so then handle these errors
        //in the global error handling middleware for production mode.
        const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET); //the resolved value of the promise is
        //the decoded payload from JWT
        // 3) If varification is successful then check that user exists.
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next();
        }
        // 4) Check if user changed password after the token was issued.
        //call the instance method on the user documenet, iat means issueAt time in milisec
        if(currentUser.changedPasswordAfter(decoded.iat)){ //if password change then errro.
            return next();
        }
        //There is a logged in user.
        //make that user access to templates
        res.locals.user = currentUser; //user is a variable in the temp and pug template would get access to it
        return next();
        } catch (err){
            return next();
        } 
        }
    next();//if no cookie then next middleware is called.
};


//Middleware function to delete tours based on authorization
exports.restrictTo = (...roles) => {//pass arbitrary number of roles,so use rest parameters syntax,create an array of
//all the arguments we specified.
    return (req,res,next) => {
     //this gets access to roles parameter bcz of closure.
     //roles ['admin','lead-guide'] -> give access when user role is inside this roles array.
     if(!roles.includes(req.user.role)){ //role of current user store in req.user
        return next(new AppError("You don't have permission to perform this action",403)); //403 means forbiden
    } 
     next(); //pass the middleware to the next route handler, delete tours
    };
}; 

exports.forgotPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on POSTed email.
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('Ther is no email with this email address',404)); 
    }
    // 2) Generate the random reset token.
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false}); //in above fun we just modify the document now we need to save it.
    //we save data without providing mandatory data(required fields), this deactivate all validators
    // 3) Send it back to user's email.
    //defining the rset url, //get data from req. 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`; 
    const message = `Forgot your password? Submit a PATCH request with your new password and passworsConfirm 
    to: ${resetURL}. \n If you didn't forget your password, please ignore this email !`; 
    try{
        await sendEmail({ //finally send the email.
            email: user.email, //same as req.body.email
            subject: 'Your password reset token (valid for 20 min)', 
            message
        }); 
        //Always send response otherwise the req, res cycle never finish.
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    }
    catch(err){  //reset both the token expires property.
        user.PasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false});
    }
    return next(new AppError('There is an error sending the email. Try again later',500));
});

exports.resetPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on token, this token can identify the user, query the db and find user of this token.
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');//update the string we want to hash
    //find the user having token that send via URL
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt:Date.now()}});
    // 2) Set new password only if token has not expired and there is user.
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined; //delete the reset and expired token
    user.passwordResetExpires = undefined;
    await user.save(); //save the documnet
    // 3) Update the changedPasswordAt property for current user.

    // 4) Log the user in, send JWT to the client
    createAndSendtoken(user,200,res);
});

exports.updateMyPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on current password from the collection.
    const user = await User.findById(req.user.id).select('+password');//here we have current user at req object
    // 2) Check if POSTed password is correct.
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong',401));
    }
    // 3) If correct , update password.
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //User.findByIdAndUpdate will not work as intended!
    // 4) Log user in, send JWT with logged user in with new token.
    createAndSendtoken(user,200,res); 
});