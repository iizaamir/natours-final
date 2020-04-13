const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


//CREATE A FUNCTION THAT WILL RETURN A FUNCTION , FOR ALL MODELS, Inside factory function call the model,
// To delete a document.
exports.deleteOne = Model => //this fun returns this handler function catchAsync
catchAsync(async (req,res,next) => { //send only the data that is chaning.
        const doc = await Model.findByIdAndDelete(req.params.id); //Don't save to vairable bcz don't want to send something to client
        if(!doc){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
            //global error handling middleware
            return next(new AppError('No document found with that id',404)); //jump to the error handling middleware,
            //return immediatly and not move to next line, below code
        };
        res.status(204).json({ //204 when we delete an object
            status : 'success',
            data : null
        });
    });

// To update a document.
exports.updateOne = Model => 
catchAsync(async (req,res,next) => { //send only the data that is chaning.
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{ //2nd is the data that we actually want 
        //to change is in post req
        new : true, //with this new updated document will be returned
        runValidators: true // again the data validators run each time
    }); 
    if(!doc){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
        //global error handling middleware
        return next(new AppError('No document found with that id',404)); //jump to the error handling middleware,
        //return immediatly and not move to next line, below code
    };
    res.status(200).json({
        status : 'success',
        data : {
            data: doc
        }
    });
});
//To Create a Document.
exports.createOne = Model =>
    catchAsync(async (req,res,next) => { //Express call this fun, when createTour rout is hit
        const doc = await Model.create(req.body);//call the create methor right from the model,create returns a promise
        res.status(201).json({ //201 means created
            status : 'success',
            data : {
                data : doc
            }
        });
    });
// To get/read a document.
exports.getOne = (Model,popOptions) => catchAsync(async (req,res,next) => {//popOptionsbcz we have populate in getTour
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;
    //const doc = await Model.findById(req.params.id).populate('reviews'); //populate reviews to show review
        // for a specific tour
        //Tour.findOne({ _id: req.params.id}); //do same as above.
        if(!doc){ //if error occured , pass it to next, when next receive something, it assumes error, jump to 
            //global error handling middleware
            return next(new AppError('No document found with that id',404)); //jump to the error handling middleware,
            //return immediatly and not move to next line, below code
        };
        res.status(200).json({ //sending the json response.
        status : 'success',
        data :{
            data : doc  
        }
    });
});

//To getAll documents.
exports.getAll = Model => catchAsync(async (req,res,next) => {
    //To allow for nested GET reviews on tour.(hack)
    let filter;
    if(req.params.tourId) filter = {tour : req.params.tourId}; 
    // 1st we built the query, in another file.
        console.log(req.query)
    // 2nd WE EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter),req.query).filter().sort().limitFields().paginatie(); 
    //pass query obj and the query string
    // const doc = await features.query.explain();
    const doc = await features.query;
    // const tours = await query;
    res.status(200).json({ //sending the json response.
        status : 'success',
        // requestedAt : req.requestTime,
        results : doc.length, //No of results we are sending in tours array.
        data : {
            data : doc 
        }
    }); 
}); 

