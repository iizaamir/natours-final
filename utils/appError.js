//All the AppError are operational bcz of property isOperational=true
class AppError extends Error { //class Inheritance from builtin Errror class 
    constructor(message,statusCode){ //constructor called each time we create an obj
        super(message);//bcz we extend so need to call the parent class constructor,bnuiltin error only accepts message.
        this.statusCode = statusCode;
        //status may be either fail or error, if 400 then status fail else if 500 then error
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOpeational = true; //predict the operational errors, e.g user create tour withour required fields
        //When a new obj is created and a function constructor is called, that function call does't appear 
        //in the stack trace and will not pollute it.
        Error.captureStackTrace(this,this.constructor); //Don't want to add this class in the err stack, 
        //1sat para is this is current obj, 2nd para is AppError class itself
    }
}
module.exports = AppError;