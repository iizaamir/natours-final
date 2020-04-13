const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please tell us your name']
    },
    email : {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true, //unique identifier of each user.
        lowercase: true, // set the email to lowercase
        validate: [validator.isEmail,'Please provide a valid email'] //email in the right format
    },
    photo : String, //if user want to upload a photo then that photo stored in the file System
    role: {
        type: String,
        enum: ['user','guide','lead-guide','admin'], //enum allow certain types of roles.
        default: 'user'
    },
    password : {
        type : String,
        required: [true,'Please provide a password'],
        minlength: 8, //Password must have eight characters.
        select: false //never show on any output
    },
    passwordConfirm : {
        type : String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This custom validator only works on create() and SAVE()  
            validator: function(el) {//this function is called when a new document is created
                return el === this.password; //return either true or false(validation error) // ali123 === ali123
            },
            message:'Passwords are not the same!'
        }
    },
    passwordChangedAt : Date,  //this property changed only when someone change the password
    passwordResetToken : String,
    passwordResetExpires : Date,
    active: {
        type: Boolean,
        default: true,
        select: false, //don't want to show in output.
    }
});

//To encrypt password use mongoose document middleware.
userSchema.pre('save', async function(next){//happens between moment we recieve the data and then actually save data in db
    if(!this.isModified('password')) return next(); //encrypt password only when we create or update password
    this.password = await bcrypt.hash(this.password,12); //12 is cost parameter,responsible for hashing,
    // if high better encryption, hash is async vesrion and returns a proise.
    this.passwordConfirm = undefined; //want to delete this field, only need password confirm for validation before
    next();
}); 
//update passwordChangedAt propert for current user
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next(); //if password not modified or doc is new.
    this.passwordChangedAt = Date.now() - 5000; //saving to db is slower then issuing the json we token
    next();
});

userSchema.pre('/^find/',function(next){ //happen before a query, start with find
    //this points to current query.
    this.find({active: {$ne: false}});
    next();
}) 

//Instance method to compare the password with the hashed password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};
// Instance method to check if password changed.
userSchema.methods.changedPasswordAfter = function(JWTTimestemp){ //JWTTimestemp when the token was issued.
    if(this.passwordChangedAt){ //if passwordChangedAt propert exist
        //convert date to time in mili so sec-> /1000 with base 10
        const changedTimestemp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);  
        //console.log(changedTimestemp,JWTTimestemp);//1st is in date format 2nd is in time in sec format 
        //cahnged means that the time at which token issued is less than changed timestemp.
        return JWTTimestemp < changedTimestemp; // 100 < 200 (true)
    }
    return false; //return false that means user has not changed his password after the token was issued
};
//Instance method to generate random reset token.
userSchema.methods.createPasswordResetToken = function(){  //random string
    const resetToken = crypto.randomBytes(32).toString('hex');//32 charachters convert to haxadecimal string
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');  //sha256 is an algo,
    //this encrypted token is in tha database.
    //console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now()+ 20 * 60 * 1000; //20 mins * 60 for sec and 1000 for milisec
    return resetToken;  //plain text token that is send to email
}

const User = new mongoose.model('User',userSchema); //model variables are with capital latter
module.exports = User;