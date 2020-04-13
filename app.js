const path = require('path'); //to manipulate path
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); //parse all the cookies from the incoming request.
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');
//path is relative to the root dir (where we launch our node.js application)
app.set('views', path.join(__dirname, 'views')); //Where our template engine in located


app.use(cors());

app.options('*', cors());

//Serving static files.
app.use(express.static(path.join(__dirname,'public')));  //all static files automatically server from folder public


//THESE ALL ARE THE MIDDLEWARES.
//Set security http headers.
app.use(helmet()); //this fun call returns a function, put this middleware in start so that to set headers
console.log(process.env.NODE_ENV);
//Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); //the argument specify that how the logging will look like.
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})); //express.json is the middleware, limit amount of data that comes in body.
app.use(express.urlencoded({ extended: true, limit: '10kb'})); //parse data coming from a url encoded form.
app.use(cookieParser()); //parse data from the cookie
//Data sanitization against NoSql query injection.
app.use(mongoSanitize()); //this looks in request body,querystring,params then filterout $ sings and dots
//Data sanitization against XSS(Cross site scripting attacks).
app.use(xss()); //clean user input from malacious html code
//Prevent parameter pollution
app.use(hpp({
    //an array of properties that we allow duplicates in query string
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));
//Serving static files.
//app.use(express.static(`${__dirname}/public`)); //this is a builtin middleware, pass diractory to where we serve the static files

//Creating our own middleware function that we want to add in middleware stack
// app.use((req,res,next) => {
//     console.log('Hello from middlweare.');
//     next(); //if we didn't call the next function then the req,res cycle is stuck at this point
// });
app.use(compression());
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString(); //manipulate the req object
    // console.log(req.requestTime);
    // console.log(req.cookies);
    //console.log(req.headers); //get access to http request headers, that client send with request
    next();
});

// app.get('/' , (req,res) => { //defining the root url,
//     //res.status(200).send('Hello from server side'); 
//     res.status(200).json({message : 'Hello from server side' , app : 'Natours'}); //To send the json response. 
// });  
// app.post('/',(req,res) => {
//     res.send('You can post to this end point');
// });
//ROUTES
//Mounting the routers come after all of these declerations
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter); // /api/v1/tours is where we want to use out tourRouter. 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoute);
//This middleware execute after all others, that can handle any http request methods with all
app.all('*',(req,res,next) => { //*means everything
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // });

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail'; //define status and statusCode property on error obj.
    // err.statusCode = 404;
    //next(err);//now we need to pass the error into next,when we pass anything into next it will assume as error. 
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//An Error Handling Middleware In One Central Place
// app.use((err,req,res,next) => {
//     console.log(err.stack); //show us where the error happend
//     err.statusCode = err.statusCode || 500;// err.statusCode contain different codes(not fixed),500(internal server)
//     err.status = err.status || 'error'; //err.status if it is defined.
//     res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message 
//     });
// });
app.use(globalErrorHandler);
module.exports = app;