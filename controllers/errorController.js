//An Error Handling Middleware In One Central Place
const AppError = require('./../utils/appError');
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message,400);
};
const handleDuplicateFieldsDB = err => {
    const value = err.err.msg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];//Use regular exp to find the text between quotes,
    //it returns an array we want 1st element so [0]
    // console.log(value);
    const message = `Duplicate value : ${value}, Please use another value`;
    return new AppError(message,400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message); //errors is array of all error messages,
    //el is current element.
    const message = `Invalid input data, ${errors.join('. ')}`; //join all the errors in one string using . and spce
    return new AppError(message,400);
}
const handleJWTError = () => new AppError('Invalid token, Please login again!',401); 
const handleJWTExpiredError = () => new AppError('Your token time has expired, Please login again',401);
//Function for development mode.
const sendErrorDev = (err,req,res) => {
        // A) API
        if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({ //same response no matter we r in development or production
            status: err.status,
            error:err,
            message: err.message,
            stack: err.stack
        });
        }
         // B) if not then render an error.
        console.error('Error is : ', err);
        return res.status(err.statusCode).render('error',{
            title: 'Something went  wrong',
            msg: err.message
        }); 
};
//Function for production mode.
const sendErrorProd = (err,req,res) => {
    // A) For API
    if(req.originalUrl.startsWith('/api')){
        // A) Operational, trusted error: send message to client.
        if(err.isOperational){ //operational err, e.g db connection or network error, then send more info related to error
            return res.status(err.statusCode).json({ //same response no matter we r in development or production
                status: err.status,
                message: err.message
            });
        }
        // B) programming or other unknown err, don't leak error details. 
        // 1) Log error
        console.error('Error is : ', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        });
    }
    // B) For RENDERED website
    // A) //if not then render an error.
    // A) Operational, trusted error: send message to client.
    if(err.isOperational){
        return res.status(err.statusCode).render('error',{
            title: 'Something went wrong',
            msg: err.message
        });
    }
    // B) programming or other unknown err, don't leak error details. 
    // 1) Log error
    console.error('Error is : ', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error',{
        title: 'Something went  wrong',
        msg: 'Please try again later.'
    });
};
// app.use((err,req,res,next) => {
    module.exports = (err,req,res,next) => {
    // console.log(err.stack); //show us where the error happend
    err.statusCode = err.statusCode || 500;// err.statusCode contain different codes(not fixed),500(internal server)
    err.status = err.status || 'error'; //err.status if it is defined.
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    }
    else if(process.end.NODE_ENV === 'production'){
        let error = {...err}; //destructuring of orignal error and create new obj of same data
        error.message = err.message;

        if(error.name = 'CastError') error = handleCastErrorDB(error); //cast error when we enter an invalid id, 
        //err return a new error created by AppError class & that error is operational
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(); //when user gives an invalid token
        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();//when token time is expired.
        sendErrorProd(error,req,res);
    }
};