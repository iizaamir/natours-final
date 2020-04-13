const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
//const validator = require('validator');
//Implementing a simple tour schema and model.
const tourSchema = new mongoose.Schema({ //Pass schema defination as an a schema object.
    name: {
        type : String,
        required : [true,'A our must have a name'],
        unique : true, //two tour document cannot have a same name.
        trim : true, //remove all the white space in the beginning and at the end of the string.
        maxlength: [40,'A tour name must have less or equal then 40 characters'], //maximum length a string have.
        minlength: [10,'A tour name must have more or equal then 10 characters']
        // validate : [validator.isAlpha,'Tour name must only contain characters']
    },
    slug : String,
    duration : {
        type : Number,
        required : [true,'A tour must have a duration']
    },
    maxGroupSize: {
        type : Number,
        required : [true,'Tour must have a group size']
    },
    difficulty : {
        type : String,
        required : [true,'A tour must have a difficulty'],
        enum: { //only for strings,Only restrict with 3 difficulties, for err message create an obj
        values: ["easy","medium","difficult"],
        message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage : { //giving some default values.
        type : Number, 
        default : 4.5,
        min: [1, 'Rating must be above 1.0'], //rating must always bwtween 1 and 5
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10)/10 // To get around off value, run each time a new value is set for this filed.
        //math.round return int so 4.66666 -> 46.66666 -> 47 -> 4.7 
    },
    ratingsQuantity : {
        type : Number,
        default : 0
    },
    price: {
        type : Number, 
        required : [true,'A tour must have a price'] 
    },
    priceDiscount : { //validator to check the price discount is actually lower than the price itself.
        type: Number, 
        validate : {
            validator: function(val){ //use validate property to set our own validator, val is the value that 
                // was inputed, e.g priceDiscount
                return val < this.price //100 < 200, so return true else false like 250 < 200, so
                //this point on (current doc)new document and not work on update document
            },
            message: 'Discount price ({VALUE}) should be below the regular price' //VALUE same as val
        }
    },
    summary : {
        type : String,
        trim : true, //remove all the white space in the beginning and at the end of the string.
        required : [true, 'A tour must have a description']
    },
    description: {
        type : String,
        trim : true
    },
    imageCover : {
        type : String, //simply the name of the image later we read it from file system, we have images in the files
        //then put the name of the image in database as a field.
        required : [true,'A tour must have a cover image'] 
    },
    images : [String],  //we have multiple images so save them as an array of strings
    createdAt : { // is a time stamp sets the time when user adds a new tour
        type: Date,
        default : Date.now(), //gives current time in milisec
        select : false //don't show this on the res to user,
    },
    startDates: [Date],   //Different dates at which a tour starts.
    secretTour: {
        type: Boolean, //if true it is secret tour and don't want to show
        default: false
    },

    //Not a schema type object but an embaded obj.
    startLocation: {
        //GeoJSON data format to specify geospecial data.
        type:{
            type: String,
            default: 'Point',
            enum: ['Point'] //possible options this field take
        },
        coordinates: [Number], //array is the coordinates of points, latitude and longitude. 
        address: String,
        description: String
    },
    //to create a doc and embed in another doc ,we need to create an array
    locations: [
        {
            type:{  
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number //Day of the tour people will go to this location.
        }
    ],


    // guides: Array //use for embedding user document tour and the implement then in a middleware fun below.

    guides : [ //These are sub documents(embeded documnets) by referencing
        {
            type: mongoose.Schema.ObjectId, //type of each of element in guides array is mongodb id.
            ref: 'User' //establish references between different dataset in users, don't need to import users.
        } 
    ],
    //This is child referencing so that when we query for tours, we also khow about the reviews for that specific
    //tour but the arrays grows to indefinately, so don't d0 that method.
    // Reviews: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
}, 
    {  //2nd is the object for schema options, when data is outputted as json so then true
    toJSON: {virtuals : true},
    toObject: {virtuals : true}
    }); 
//Set the index on price for better searching performance.
// tourSchema.index({price: 1}); //1, sorting price index in ascending order -1 in descending order
tourSchema.index({price: 1, ratingsAverage: -1}); //1, sorting price index in ascending order -1 in descending order.
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});//adding index to startLocation for eoSpecial queries

tourSchema.virtual('durationWeeks').get(function(){//virtual property that contains tour duration in weeks, 
    // already have in days
    return this.duration / 7;  //calculate the duration in weeks, use regular function bcz arror function
    //don't have this keyword, this is pointing to the current document
});
//Virtual populate.
tourSchema.virtual('reviews',{ //reviews is name of virtual field.
    ref: 'Review', //name of model we want to reference.
    foreignField: 'tour',
    localField: '_id'
});
//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save' , function(next){  //Define middleware on schema, pre runs before an actual event
    // console.log(this); //this point to currently processed document
    this.slug = slugify(this.name, {lower :true }); //string with witch we create a slug out of
    next();
}); //to run this middleware run a save or create command.

//Embedding tour document with tour-guide.
// tourSchema.pre('save',async function(next){
//     // this.guide is an array of all the inputs,get user document f current id, map method returns the alteration
//     //in a new array, guide array is also full of promises so need to run all promises.
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);//to run all promises,assiggn array of id's with array of docs
//     next();
// });

// tourSchema.pre('save', function(next){ //having multiple pre middleware for same hook(save)
//     console.log('Will save document');
//     next();
// });
// tourSchema.post('save', function(doc,next){ //post have also access to doc, post executed fter all pre completed.
//     console.log(doc); //here doc is the finished document.
//     next();
// });

//QUERY MIDDLEWARE runs each time when their is a query.
tourSchema.pre(/^find/, function(next){ //for all the commands starting with find e.g find, findOne, FindOneAndUpdate
//tourSchema.pre('find', function(next){ //with find this is query middlwware
    //this is pointing to current query
    this.find({ secretTour: {$ne : true}}); //find all methods where secret tour is not true.
    this.start = Date.now();
    next();
});
//Middleware for modelling tourguide(user) and tours using child referencing
tourSchema.pre(/^find/, function(next) {
    this.populate({ //populate means fill up the field guides
        path: 'guides',
        select: '-__v -passwordChangedAt'  //fields that we remove inside guides.
    });
    next();
});

tourSchema.post(/^find/, function(docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
});

//AGGREGATION MIDDLEWARE
//To filterout the secret tour, add  a match state at the begenning of the pipeline array
// tourSchema.pre('aggregate', function(next){ //before the aggregation executed
//     this.pipeline().unshift({$match: {secretTour: {$ne:true}}}); //unshift to add at the beginning
//     console.log(this.pipeline()); //this points to the current aggregation obj, the pipeline obj
//     next();
// }); 
//Create a model out of above schema.
const Tour = new mongoose.model('Tour',tourSchema);
module.exports = Tour;
//This below is just for testing.
// const testTour = new Tour({ //Document out of the tour model, pass obj with the data, like a function constructor,
//     //The testTour is the instance of the tour model, we use some mothods of it.
//     name :  'The park camper',
//     // rating : 4.7,
//     price : 999
// });
// testTour.save().then(doc => { //Save the data in the tours collection in database, save returns a promise which we can 
//     //consume, we get access to document that is saved.
//     console.log(doc);
// }).catch( err => {
//     console.log('Error : ' , err);
// }); 