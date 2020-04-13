const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 
const Tour = require('./../../models/tourModel'); //access to tour model bcz there we will write tours.
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
dotenv.config({path:'./config.env'}); //pass object to specify the path where our config file is located.

// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE;
//const DB1 = process.env.DATABASE_LOCAL;
mongoose.connect(DB,{ //To connect to db, 1st connection string 2nd options for deprication warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => { //This connection returns a promise so handle that.
    // console.log(con.connections);
    console.log('DB connection successful');
}).catch(err => console.log("Error in connected database " , err));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DATABASE
const importData = async () => {
    try{
        await Tour.create(tours); //tours is an array of object, create new document for each of the object in array.
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log('Data successfully loaded!!');
    }
    catch(err){
        console.log(err);
    }
    process.exit();  // to stop application
}
//Delete the data that is already in the database.
const deleteDate = async () =>{
    try{
        await Tour.deleteMany(); //this delete all the documents in the tours collection
        await User.deleteMany(); 
        await Review.deleteMany(); 
        console.log('Data successfully deleted!');
    }
    catch(err){
        console.log(err);
    }
    process.exit();  // to stop application
}
if(process.argv[2] === '--import'){
    importData();
}
else if(process.argv[2] === '--delete'){
    deleteDate();
}
//console.log(process.argv); //tells us about the arguments on the command line