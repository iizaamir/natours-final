const fs = require('fs');
const Tour = require('./../models/tourModel');
//const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
//Top level code executed once.
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));//converted in array of JS object.
// exports.checkID = (req,res,next,val) =>{ //middleware function to check the id is valid or not
//     console.log(`Tour id is : ${val}`);
//     if( req.params.id * 1 > tours.length){
//         return res.status(404).json({ //return bcz we want to exit the function right here, and it'll never call next,
//             status : 'fail',
//             message : 'Invalid id'
//         });
//     }
//     next(); 
// };
exports.aliasTopTours = (req,res,next) => { //set these properties of query obj, prefilling parts of query obj,
    //before we reach to getAllTours 
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price'; //ratings in desending order, if same rating then cheap price
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//TO GET THE ALL TOURS.
exports.getAllTours = factory.getAll(Tour); 
// catchAsync(async (req,res,next) => {
//         console.log(req.query);
        // //1st WE BUILT THE QUERY'
        // // 1A) Filtering
        // const queryObj = {...req.query};//query object is a reference req.query,so use destructuring and create a new obj.
        // const excludedFields = ['page','sort','limit','fields']; //array of fields that we want to exclude
        // excludedFields.forEach(el => delete queryObj[el]); //from queryObj we delete the field with name of element
        // // console.log(req.query, queryObj);
        // // 1B) Advance filtering     
        // let queryStr = JSON.stringify(queryObj); //Convert JS object to  Json string
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //using RE, 2nd is callback,  
        // //pass match string as 1st and return  the new string that will match the old one.
        // // console.log(JSON.parse(queryStr));
        // // {difficulty: 'easy' , duration: {$gte : 5}}
        // // {difficulty: 'easy' ,duration: { gte: '5' }}
        // //we want to replace gte, gt, lte, lt
        // let query = Tour.find(JSON.parse(queryStr)); //implementing a simple filter, Tour.find returns a query
        // // const quer = Tour.find({ //find returns array of all the documents 
        // //     duration:5,
        // //     difficulty: 'easy' 
        // // }); 
        // // we do query by chaining mongoose method
        // //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        // // 2) SORTING
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');//split the strings by comma, then return array 
        //     //of all fields names and then join the strings by space
        //     // console.log(sortBy)
        //     query = query.sort(sortBy); //sort according to accending order 
        // }
        // else { //adding a default one, if user doesn't specify sort fields in query string.
        //     quer = query.sort('-createdAt') //sort by created at field by desending order.
        // }
        // //3) FIELD LIMITIN
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }
        // else{ //if user doesn't specify the fields
        //     query = query.select('-__v'); //-__v means excluding this field.
        // }
        // // 4)PAGINATION
        // //1st get the page and limit from query string, and define some default values
        // const page = req.query.page * 1 || 1; // || 1 means by default page 1
        // const limit = req.query.limit * 1 || 100; // 1 page contain 100 results/documents
        // const skip = (page-1) * limit;
        // // page:2&limit:10, 1-10=>page1 , 11-20=>page2 , 21-20=>page3  
        // query = query.skip(skip).limit(limit);
        // //If user select wrong pages and limit.
        // if(req.query.page){
        //     const numTours = await Tour.countDocuments(); // return the no of documents as a promise
        //     if(skip >= numTours) throw Error('This page doesnot exist'); //this throw error move to catch block
        // }
        
        // 2nd WE EXECUTE THE QUERY
//         const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginatie(); 
//         //pass query obj and the query string
//         const tours = await features.query;
//         // const tours = await query;
//         res.status(200).json({ //sending the json response.
//             status : 'success',
//             // requestedAt : req.requestTime,
//             results : tours.length, //No of results we are sending in tours array.
//             data : {
//                 tours : tours
//             }
//         }); 
// });
//TO GET ONLY ONE TOUR.
exports.getTour = factory.getOne(Tour, {path:'reviews'}); //path property is the field we want to populate
// catchAsync(async (req,res,next) => {
//         const tour = await Tour.findById(req.params.id).populate('reviews'); //populate reviews to show review
//         // for a specific tour
//         //Tour.findOne({ _id: req.params.id}); //do same as above.
//         if(!tour){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
//             //global error handling middleware
//             return next(new AppError('No tour found with that id',404)); //jump to the error handling middleware,
//             //return immediatly and not move to next line, below code
//         };
//         res.status(200).json({ //sending the json response.
//         status : 'success',
//         data :{
//             tour : tour
//         }
//     });
// });
//To Make one function for all catch blocks
// const catchAsync = fn => {
//     return (req,res,next) => {//this is the fun that express calls when createTour handler hits, 
//         //this return is assigned to createTour
//         fn(req,res,next).catch(err => next(err));//catch means promise is rejected, catch handles the err in 
//         // the next function and error ends up in the global error handling middleware
//     };   
// };
//TO CREATE TOUR/ ADD NEW TOUR TO DATABASE.
//exports.createTour = async (req,res) => { //req obj holds all the data about the request that is done, if the request 
exports.createTour = factory.createOne(Tour);
// catchAsync(async (req,res,next) => { //Express call this fun, when createTour rout is hit
//     const newTour = await Tour.create(req.body);//call the create methor right from the model,create returns a promise
//     res.status(201).json({ //201 means created
//         status : 'success',
//         data : {
//             tour : newTour
//         }
//     });
// });
// const newTour = new Tour({}); //old way to create tour.
    // newTour.save()     
//     try{ //In async await we handle the error with async await.
//         const newTour = await Tour.create(req.body);//call the create methor right from the model,create returns a promise
//         res.status(201).json({ //201 means created
//             status : 'success',
//             data : {
//                 tour : newTour
//             }
//         });
//     }
//     catch(err){ //error occur when we create document without required fields.
//         res.status(400).json({ //400 means bad request
//             status : 'fail',
//             message : err
//         });  
//     }
// });
//TO UPDATE THE TOUR USING PATCH.
exports.updateTour = factory.updateOne(Tour);
// catchAsync(async (req,res,next) => { //send only the data that is chaning.
//         const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{ //2nd is the data that we actually want 
//             //to change is in post req
//             new : true, //with this new updated document will be returned
//             runValidators: true // again the data validators run each time
//         }); 
//         if(!tour){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
//             //global error handling middleware
//             return next(new AppError('No tour found with that id',404)); //jump to the error handling middleware,
//             //return immediatly and not move to next line, below code
//         };
//         res.status(200).json({
//             status : 'success',
//             data : {
//                 tour : tour
//             }
//         });
// });
//TO DELETE A SPECIFIC TOUR.
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req,res,next) => { //send only the data that is chaning.
//         const tour = await Tour.findByIdAndDelete(req.params.id); //Don't save to vairable bcz don't want to send something to client
//         if(!tour){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
//             //global error handling middleware
//             return next(new AppError('No tour found with that id',404)); //jump to the error handling middleware,
//             //return immediatly and not move to next line, below code
//         };
//         res.status(204).json({ //204 when we delete an object
//             status : 'success',
//             data : null
//         });
// });
exports.getTourStats = catchAsync(async (req,res,next) => { //function that calculate some statistics about our tours 
        const stats = await Tour.aggregate([ // agregation pipeline is like a regular query
            {
                $match: {ratingsAverage: {$gte:4.5}}  //match is to filter documents, each stage is object
            },
            {
                $group: { //group documents togather using accumulators 
                    //_id: null, //calculate avg for all the tours in one group
                    _id: {$toUpper: '$difficulty'}, //satistics for each difficulty 
                    numTours: {$sum: 1},//count number of tours, each of document that goes through this pipeline
                    //1 is added to this numTours counter.
                    numRatings: {$sum: '$ratingsQuantity'}, 
                    avgRating: {$avg: '$ratingsAverage'}, //calculate avg ratings of ratingsAverage field
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                } 
            },
            {
                $sort: { avgPrice: 1} //give the new field name(specify in the group)that we want to sort,
                //avgPrice 1 means ascending order 
            },
            // {
            //     $match: {_id: {$ne: 'EASY'}} //we can also repeat stages, excluding the easy one
            // }
        ]);  
        res.status(200).json({
            status : 'success',
            data : {
                stats : stats
            }
        });
});
exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates' //construct an array field of input documents and then output 
                //one document for each element of array
            },
            {   
                //select the document for the year that was passed in 
                $match: { //match is used to select the documents.
                    startDates: { //dates between 2020 and 2022
                        $gte: new Date(`${year}-01-01`), //date greater or eq to januraray 1st
                        $lte: new Date(`${year}-012-31`) //bw 1st day and the last day of the current year
                    } 
                }
            },
            {
                $group:{ //we want to group them by the month but we have entire date having year,month,date,hour
                    _id: {$month: '$startDates'}, //we extract the month from date, grouping it by month.
                    numToursStarts : {$sum : 1}, //how many btours start in this month
                    tours: { $push: '$name'} //info about which tour is to push in the name filed in an array
                }
            },
            {
                $addFields: { month : '$_id'} // value of month of field id
            },
            {
                $project: {
                    _id: 0 // _id=0 means not to show id, if 1 then show id
                }
            },
            {
                $sort: {numToursStart: 1} //sort by the no of tours, 1 for ascending
            },
            {
                $limit : 12 //allow to show 12 documents
            }
        ]); //after this we have one document for each of the dates
        res.status(200).json({
            status : 'success',
            data : {
                plan : plan
            }
        });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// //tours-within/233/center/-40,45/unit/mi 
exports.getToursWithin = catchAsync(async (req,res,next) => {
    const {distance,latlng,unit} = req.params; //using destructuring
    const [lat,lng] = latlng.split(',');  //get coordinated from latitude longitude
    const radius = unit === 'mi' ?distance/3963.2 : distance/6378.1; //distance in radius but converted to radian
    if(!lat || !lng){
        next(new AppError('Please provide latitude, longitude in the format lat,lng.',400));
    };
    // console.log(distance,lat,lng,unit);
    //Query from start location, holds geospatial point where each tour start.
    const tours = await Tour.find({ //geoWithin, finds documents within a certain geomatery
        startLocation: { $geoWithin: {$centerSphere: [[lng,lat], radius]}} //centerSphere takes an array of 
        //cordinates and the radius.
    }); 
    
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        }
    })
});


exports.getDistances = catchAsync(async (req,res,next) => {
    const {latlng,unit} = req.params; //using destructuring
    const [lat,lng] = latlng.split(',');  //get coordinated from latitude longitude

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;  // 0.001 is ame as dividing by 1000
    
    if(!lat || !lng){
        next(new AppError('Please provide latitude, longitude in the format lat,lng.',400));
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: { //only one aggegqation pipeline stage, require one of the fields on geospatial index
                near: { //point to calculate the distances.
                    type: 'Point',
                    coordinates: [lng *1 , lat *1 ] //multiply bu 1 to convert into numbers.
                },
                distanceField: 'distance',   //where all the calculated distances will store.
                distanceMultiplier: multiplier  //convert meters to kilometers by dividing the distance by thousands
            } 
        },
        {
        $project: { //in project only name the fields we want to keep.
            distance: 1,
            name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success', 
        data: {
            data: distances
        }
    })
});



//We don't hace one export so we don't use module.exports, so we put all these functions to the exports object