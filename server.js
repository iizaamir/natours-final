const mongoose = require('mongoose');
const dotenv = require('dotenv'); //Dotenv is a simple way to allow you to create secret keys that your 
//application needs to function and keep them from going public
process.on("uncaughtException" , err => { //we r listening to an event.
    console.log(err.name, err.message); //defaults errors.
    console.log('UNHANDLED EXCEPTION! Shutting Down....');
}); 
dotenv.config({path:'./config.env'}); //pass object to specify the path where our config file is located.
const app = require('./app'); //always require app file atfer environment variables are reead from config file.
// console.log(app.get('env')); //To check the environment variable.
//console.log(process.env); //These variables comes from the process core modules, dont need to require process

//const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE; //to connect with the database on mongoose atlas.
//const DB = process.env.DATABASE_LOCAL; //to connect with the local database.
mongoose.connect(DB,{ //To connect to db, 1st connection string 2nd options for deprication warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => { //This connection returns a promise so handle that.
    // console.log(con.connections);
    console.log('DB connection successful');
}).catch(err => console.log("Error in connected database " , err));

const port = process.env.PORT || 5000; //port should be coming from either environment or 4000
const server = app.listen(port,()=>{
    console.log(`App running on port ${port}`);
});
process.on('unhandledRejection' , err => {  //this is for unhandled promise rejection, one central place.
    console.log(err.name, err.message); //defaults errors.
    console.log('UNHANDLED REJECTIONS! Shutting Down....');
    server.close(() => { //to give server time to finish all the requests.
        process.exit(1); // if prob in db, we need to shut doen our applicaion, 1 means success
    });
});

